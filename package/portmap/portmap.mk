################################################################################
#
# portmap
#
################################################################################

PORTMAP_VERSION = 6.0
PORTMAP_SITE = $(DLINK_GIT_STORAGE)/portmap
PORTMAP_LICENSE = BSD-4-Clause-UC
PORTMAP_LICENSE_FILES = portmap.c
PORTMAP_SBINS = portmap pmap_dump pmap_set

PORTMAP_FLAGS = NO_TCP_WRAPPER=1 NO_PIE=1 NO_PERROR=1
ifeq ($(BR2_USE_MMU),)
PORTMAP_FLAGS += NO_FORK=1
endif

define PORTMAP_BUILD_CMDS
	CFLAGS="$(TARGET_CFLAGS)" \
	$(MAKE) CC="$(TARGET_CC)" -C $(@D) $(PORTMAP_FLAGS)
endef

define PORTMAP_INSTALL_TARGET_CMDS
	for sbin in $(PORTMAP_SBINS); do \
		$(INSTALL) -D $(@D)/$$sbin $(TARGET_DIR)/sbin/$$sbin; \
	done
	$(INSTALL) -D $(@D)/portmap.man \
		$(TARGET_DIR)/usr/share/man/man8/portmap.8
	$(INSTALL) -D $(@D)/pmap_dump.8 \
		$(TARGET_DIR)/usr/share/man/man8/pmap_dump.8
	$(INSTALL) -D $(@D)/pmap_set.8 \
		$(TARGET_DIR)/usr/share/man/man8/pmap_set.8
endef

$(eval $(call GENTARGETS))
