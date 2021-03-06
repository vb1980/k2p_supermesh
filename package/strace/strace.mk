################################################################################
#
# strace
#
################################################################################

STRACE_VERSION = 4.20
STRACE_SITE = $(DLINK_GIT_STORAGE)/strace
STRACE_SITE_METHOD = git
STRACE_LICENSE = BSD-3-Clause
STRACE_LICENSE_FILES = COPYING

# strace bundle some kernel headers to build libmpers, this mixes userspace
# headers and kernel headers which break the build with musl.
# The stddef.h from gcc is used instead of the one from musl.
ifeq ($(BR2_TOOLCHAIN_USES_MUSL),y)
STRACE_CONF_OPT += st_cv_m32_mpers=no \
	st_cv_mx32_mpers=no
endif

define STRACE_REMOVE_STRACE_GRAPH
	rm -f $(TARGET_DIR)/usr/bin/strace-graph
endef

STRACE_POST_INSTALL_TARGET_HOOKS += STRACE_REMOVE_STRACE_GRAPH

$(eval $(call AUTOTARGETS))
