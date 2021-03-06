#############################################################
#
# Build the jffs2 root filesystem image
#
#############################################################

JFFS2_OPTS := -e $(BR2_TARGET_ROOTFS_JFFS2_EBSIZE)
SUMTOOL_OPTS := $(JFFS2_OPTS)

ifeq ($(BR2_TARGET_ROOTFS_JFFS2_PAD),y)
ifneq ($(strip $(BR2_TARGET_ROOTFS_JFFS2_PADSIZE)),0x0)
JFFS2_OPTS += --pad=$(strip $(BR2_TARGET_ROOTFS_JFFS2_PADSIZE))
else
JFFS2_OPTS += -p
endif
SUMTOOL_OPTS += -p
endif

ifeq ($(BR2_TARGET_ROOTFS_JFFS2_LE),y)
JFFS2_OPTS += -l
SUMTOOL_OPTS += -l
endif

ifeq ($(BR2_TARGET_ROOTFS_JFFS2_BE),y)
JFFS2_OPTS += -b
SUMTOOL_OPTS += -b
endif

JFFS2_OPTS += -s $(BR2_TARGET_ROOTFS_JFFS2_PAGESIZE)
ifeq ($(BR2_TARGET_ROOTFS_JFFS2_NOCLEANMARKER),y)
JFFS2_OPTS += -n
SUMTOOL_OPTS += -n
endif

ROOTFS_JFFS2_DEPENDENCIES = host-mtd

ifneq ($(BR2_TARGET_ROOTFS_JFFS2_SUMMARY),)
define ROOTFS_JFFS2_CMD
	$(MKFS_JFFS2) $(JFFS2_OPTS) -d $(TARGET_DIR) -o $$@.nosummary && \
	$(SUMTOOL) $(SUMTOOL_OPTS) -i $$@.nosummary -o $$@ && \
	rm $$@.nosummary
endef
else
define ROOTFS_JFFS2_CMD
	$(MKFS_JFFS2) $(JFFS2_OPTS) -d $(TARGET_DIR) -o $$@
endef
endif

define JFFS2_GEN_SREC
	$(TARGET_CROSS)objcopy -I binary -O srec --adjust-vma 0xa1000000 $$@ $$@.srec
endef

ifeq ($(BR2_JFFS2_TARGET_SREC),y)
ROOTFS_JFFS2_POST_GEN_HOOKS += JFFS2_GEN_SREC
endif

$(eval $(call ROOTFS_TARGET,jffs2))
