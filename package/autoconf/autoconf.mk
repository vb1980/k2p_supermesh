################################################################################
#
# autoconf
#
################################################################################

AUTOCONF_VERSION = 2.69
AUTOCONF_SOURCE = autoconf-$(AUTOCONF_VERSION).tar.xz
AUTOCONF_SITE = $(DLINK_STORAGE)

AUTOCONF_LICENSE = GPL-3.0-or-later WITH Autoconf-exception-3.0
AUTOCONF_LICENSE_FILES = COPYINGv3 COPYING.EXCEPTION

HOST_AUTOCONF_CONF_ENV = \
	EMACS="no" \
	ac_cv_path_M4=$(HOST_DIR)/usr/bin/m4 \
	ac_cv_prog_gnu_m4_gnu=no

HOST_AUTOCONF_DEPENDENCIES = host-m4 host-libtool

$(eval $(call AUTOTARGETS,host))

# variables used by other packages
AUTOCONF = $(HOST_DIR)/usr/bin/autoconf
AUTOHEADER = $(HOST_DIR)/usr/bin/autoheader
AUTORECONF = $(HOST_CONFIGURE_OPTS) ACLOCAL="$(ACLOCAL)" AUTOCONF="$(AUTOCONF)" AUTOHEADER="$(AUTOHEADER)" AUTOMAKE="$(AUTOMAKE)" AUTOPOINT=/bin/true $(HOST_DIR)/usr/bin/autoreconf -f -i -I "$(ACLOCAL_DIR)" -I "$(ACLOCAL_HOST_DIR)"
