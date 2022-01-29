#############################################################
#
# MDNSRESPONDER
#
#############################################################
MDNSRESPONDER_VERSION = master
MDNSRESPONDER_SITE = $(DLINK_GIT_STORAGE)/mdnsresponder
MDNSRESPONDER_LICENSE = Apache-2.0
MDNSRESPONDER_LICENSE_FILES =

MDNSRESPONDER_AUTORECONF = NO
MDNSRESPONDER_INSTALL_STAGING = NO
MDNSRESPONDER_INSTALL_TARGET = YES

MDNSRESPONDER_DEPENDENCIES = jansson deuteron_framework

MDNSRESPONDER_CFLAGS  += $(TARGET_CFLAGS) -I. -Wall -s -O2 -I$(STAGING_DIR)/usr/include -fPIC
MDNSRESPONDER_LDFLAGS += -ljansson -ld_service_notify -L$(STAGING_DIR)/usr/lib -Wl,-rpath-link,$(STAGING_DIR)/lib -Wl,-rpath-link,$(STAGING_DIR)/usr/lib
MDNSRESPONDER_MAKE_ENV = CC="$(TARGET_CC)" LD="$(TARGET_LD)" EXTRA_CFLAGS="$(MDNSRESPONDER_CFLAGS)" EXTRA_LDFLAGS="$(MDNSRESPONDER_LDFLAGS)"


define MDNSRESPONDER_BUILD_CMDS
	$(TARGET_MAKE_ENV) $($(PKG)_MAKE_ENV) $(MAKE) $($(PKG)_MAKE_OPT) -C $(@D) setup
	$(TARGET_MAKE_ENV) $($(PKG)_MAKE_ENV) $(MAKE) $($(PKG)_MAKE_OPT) -C $(@D)
endef

define MDNSRESPONDER_CLEAN_CMDS
	$(MDNSRESPONDER_MAKE_ENV) $(MAKE) -C $(@D) clean
endef

define MDNSRESPONDER_INSTALL_STAGING_CMDS
	$(MDNSRESPONDER_MAKE_ENV) $(MAKE) -C $(@D) install INSTALLDIR=$(STAGING_DIR)
endef

define MDNSRESPONDER_INSTALL_TARGET_CMDS
	$(MDNSRESPONDER_MAKE_ENV) $(MAKE) -C $(@D) install INSTALLDIR=$(TARGET_DIR)
endef


$(eval $(call GENTARGETS))