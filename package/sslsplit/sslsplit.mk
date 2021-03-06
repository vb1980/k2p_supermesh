SSLSPLIT_VERSION = master
SSLSPLIT_SITE = $(DLINK_GIT_STORAGE)/sslsplit
SSLSPLIT_LICENSE = BSD-2-Clause AND MIT AND APSL-2.0
SSLSPLIT_LICENSE_FILES = LICENSE LICENSE.contrib LICENSE.third
SSLSPLIT_DEPENDENCIES = openssl libevent

define SSLSPLIT_BUILD_CMDS
	CFLAGS="$(TARGET_CFLAGS)" LDFLAGS="$(TARGET_LDFLAGS)" $(MAKE) CC="$(TARGET_CC)" LD="$(TARGET_LD)" OPENSSL_BASE="$(STAGING_DIR)/usr" LIBEVENT_BASE="$(STAGING_DIR)" -C $(@D)
endef

define SSLSPLIT_CLEAN_CMDS
	$(MAKE) OPENSSL_BASE="$(STAGING_DIR)/usr" LIBEVENT_BASE="$(STAGING_DIR)" -C $(@D) clean
endef

define SSLSPLIT_INSTALL_TARGET_CMDS
	$(INSTALL) -D -m 0755 $(@D)/sslsplit $(TARGET_DIR)/usr/bin/sslsplit
	$(TARGET_STRIP) $(TARGET_DIR)/usr/bin/sslsplit
endef

$(eval $(call GENTARGETS))
