/*
 *  Fastpath module for NAT speedup.
 *  This module write BCM LTD used some GPLv2 code blocks. It grants the right to change the license on GPL.
 *
 *  Some code clenup and rewrite - Tomato, wl500g and Wive-NG projects.
 *  Code refactoring and implement fastroute without nat and local connection offload by Wive-NG
 *
 *      This program is free software, you can redistribute it and/or
 *      modify it under the terms of the GNU General Public License
 *      as published by the Free Software Foundation; either version
 *      2 of the License, or (at your option) any later version.
 *
 */

#include "bcm_nat.h"
#include <net/netfilter/nf_nat.h>
#include <net/netfilter/nf_nat_l3proto.h>
#include <net/netfilter/nf_nat_l4proto.h>
#include <net/netfilter/nf_conntrack_core.h>
#include <net/netfilter/nf_conntrack_ecache.h>	/* nf_conntrack_event_cache() */
#include <net/arp.h>
#include <linux/module.h>

/* redefines */
#define NF_IP_PRE_ROUTING	NF_INET_PRE_ROUTING	/* like in ipt_ROUTE.h */
#define NF_IP_LOCAL_OUT		NF_INET_LOCAL_OUT
#define NF_IP_POST_ROUTING	NF_INET_POST_ROUTING
#define IPCT_STATUS		IPCT_ASSURED /* ???? looks like yes */


#if 0
/*
 * check SKB really accesseble
 */
inline int skb_is_ready(struct sk_buff *skb)
{
	if (skb_cloned(skb) && !skb->sk)
		return 0;
	return 1;
}
EXPORT_SYMBOL_GPL(skb_is_ready);
#endif
/*
 * check route mode
 * 1 - clean route without adress changes
 * 0 - route with adress changes
 */
#warning make static inline
inline int is_pure_routing(struct nf_conn *ct)
{
	struct nf_conntrack_tuple *t1, *t2;

	t1 = &ct->tuplehash[IP_CT_DIR_ORIGINAL].tuple;
	t2 = &ct->tuplehash[IP_CT_DIR_REPLY].tuple;

	return (t1->dst.u3.ip == t2->src.u3.ip &&
		t1->src.u3.ip == t2->dst.u3.ip &&
		t1->dst.u.all == t2->src.u.all &&
		t1->src.u.all == t2->dst.u.all);
}
EXPORT_SYMBOL_GPL(is_pure_routing);

/*
 * Direct send packets to output.
 * Stolen from ip_finish_output2.
 */
static inline int bcm_fast_path_output(struct sk_buff *skb)
{
	struct dst_entry *dst = skb_dst(skb);
	struct rtable *rt = (struct rtable *)dst;
	struct net_device *dev = dst->dev;
	int hh_len = LL_RESERVED_SPACE(dev);
	struct neighbour *neigh;
	u32 nexthop;
	int ret = 0;

/* farisey: #19188 ???? ppp0 (pppoe)
 * ???????? ???????? ?????????????????? ?????? ?????????????? ?? dev->header_ops->create
 * ?????? ?????????????????? ????-???? ????????, ?????? dev->header_ops ??????????????.
 * ?????????????? ????????????????. ?? ?????? ?????? ??????????, ?????????????? ?? ??????
 * >> bcm_fast_path_output:82: net_device "ppp0" has no header_ops!!
 * if (!dev->header_ops)
 *	if (net_ratelimit())
 *		printk("%s:%d: net_device \"%s\" has no header_ops!!\n", __func__, __LINE__, dev->name);
 */
	/* Be paranoid, rather than too clever. */
	if (unlikely( (skb_headroom(skb) < hh_len) && dev->header_ops && dev->header_ops->create)) {
		struct sk_buff *skb2;

		skb2 = skb_realloc_headroom(skb, hh_len);
		if (skb2 == NULL) {
			kfree_skb(skb);
			return -ENOMEM;
		}
		if (skb->sk)
			skb_set_owner_w(skb2, skb->sk);
		kfree_skb(skb);
		skb = skb2;
	}

#if 0
	if (dst->hh)
		ret = neigh_hh_output(dst->hh, skb);
	else if (dst->neighbour)
		ret = dst->neighbour->output(skb);
	else {
#ifdef DEBUG
		if (net_ratelimit())
			printk(KERN_DEBUG "bcm_fast_path_output: No header cache and no neighbour!\n");
#endif
		kfree_skb(skb);
		return -EINVAL;
	}
#endif
	rcu_read_lock_bh();
	nexthop = (__force u32) rt_nexthop(rt, ip_hdr(skb)->daddr);
	neigh = __ipv4_neigh_lookup_noref(dev, nexthop);
	if (unlikely(!neigh))
		neigh = __neigh_create(&arp_tbl, &nexthop, dev, false);
	if (!IS_ERR(neigh)) {
		ret = dst_neigh_output(dst, neigh, skb);
	}
	else {
		rcu_read_unlock_bh();
		net_dbg_ratelimited("%s: No header cache and no neighbour!\n",
				    __func__);
		kfree_skb(skb);
		return -EINVAL;
	}
	rcu_read_unlock_bh();

	/* Don't return 1 */
	return (ret == 1) ? 0 : ret;
}

int FASTPATHNET bcm_fast_path(struct sk_buff *skb)
{
	if (!skb_dst(skb)) {
		struct iphdr *iph = ip_hdr(skb);
		struct net_device *dev = skb->dev;

		if (ip_route_input(skb, iph->daddr, iph->saddr, iph->tos, dev)) {
			kfree_skb(skb);
			return -EINVAL;
		}

		/*  Change skb owner to output device */
		skb->dev = skb_dst(skb)->dev;
	}

	if (unlikely(skb->len > ip_skb_dst_mtu(skb) && !skb_is_gso(skb)))
		return ip_fragment(skb, bcm_fast_path_output);

	return bcm_fast_path_output(skb);
}

int FASTPATHNET bcm_do_fastroute(struct nf_conn *ct,
		struct sk_buff *skb,
		unsigned int hooknum,
		int set_reply)
{
        /* change status from new to seen_reply. when receive reply packet the status will set to establish */
        if (set_reply && !test_and_set_bit(IPS_SEEN_REPLY_BIT, &ct->status))
	    nf_conntrack_event_cache(IPCT_STATUS, ct);

	if(hooknum == NF_IP_PRE_ROUTING) {
	    skb->cb[NF_FAST_ROUTE]=1;
	    /* this function will handle routing decision. the next hoook will be input or forward chain */
	    if (ip_rcv_finish(skb) == NF_FAST_NAT) {
	        /* Change skb owner to output device */
	        skb->dev = skb_dst(skb)->dev;
	        skb->protocol = htons(ETH_P_IP);
	        return NF_FAST_NAT;
	    }
	    /* this tell system no need to handle this packet. we will handle this. */
	    return NF_STOLEN;
	} else {
	    if(hooknum == NF_IP_LOCAL_OUT) {
		/* Change skb owner to output device */
		skb->dev = skb_dst(skb)->dev;
		skb->protocol = htons(ETH_P_IP);
		return NF_FAST_NAT;
	    }
	}

	/* return accept for continue normal processing */
	return NF_ACCEPT;
}

int FASTPATHNET bcm_do_fastnat(struct nf_conn *ct,
		enum ip_conntrack_info ctinfo,
		struct sk_buff *skb,
		struct nf_conntrack_l3proto *l3proto,
		struct nf_conntrack_l4proto *l4proto)
{
	static int hn[2] = {NF_IP_PRE_ROUTING, NF_IP_POST_ROUTING};
	enum ip_conntrack_dir dir = CTINFO2DIR(ctinfo);
	unsigned int i = 1;

	do {
		enum nf_nat_manip_type mtype = HOOK2MANIP(hn[i]);
		unsigned long statusbit;

		if (mtype == NF_NAT_MANIP_SRC)
			statusbit = IPS_SRC_NAT;
		else
			statusbit = IPS_DST_NAT;

		/* Invert if this is reply dir. */
		if (dir == IP_CT_DIR_REPLY)
			statusbit ^= IPS_NAT_MASK;

		if (ct->status & statusbit) {
			const struct nf_nat_l3proto *l3natproto;
			const struct nf_nat_l4proto *l4natproto;
			struct nf_conntrack_tuple target;

			if (!skb_dst(skb) && mtype == NF_NAT_MANIP_SRC) {
				struct net_device *dev = skb->dev;
				struct iphdr *iph = ip_hdr(skb);

				if (ip_route_input(skb, iph->daddr, iph->saddr, iph->tos, dev))
					return NF_DROP;

				/* Change skb owner to output device */
				skb->dev = skb_dst(skb)->dev;
			}

			/* We are aiming to look like inverse of other direction. */
			nf_ct_invert_tuple(&target, &ct->tuplehash[!dir].tuple, l3proto, l4proto);

			l3natproto = __nf_nat_l3proto_find(target.src.l3num);
			l4natproto = __nf_nat_l4proto_find(target.src.l3num,
							   target.dst.protonum);
			if (!l3natproto->manip_pkt(skb, 0, l4natproto, &target, mtype))
				return NF_DROP;
		}
	} while (i++ < 2);

	return NF_FAST_NAT;
}

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Broadcom Corporation");
MODULE_DESCRIPTION("Broadcom fastpath module for NAT offload.\n");
