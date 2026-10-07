include $(TOPDIR)/rules.mk

LUCI_TITLE:=Prism Theme for LuCI (8 appearances)
LUCI_DEPENDS:=+luci-base +luci-theme-bootstrap
LUCI_URL:=https://github.com/S1lenix/luci-theme-prism
LUCI_MAINTAINER:=S1lenix
LUCI_MINIFY_JS:=0
LUCI_MINIFY_CSS:=0
PKG_VERSION:=0.5.0
PKG_RELEASE:=1

# SPDX-License-Identifier: Apache-2.0
PKG_LICENSE:=Apache-2.0

define Build/Prepare/luci-theme-prism
	$(INSTALL_DIR) $(PKG_BUILD_DIR)/root/usr/share/doc/luci-theme-prism
	$(CP) ./LICENSE ./NOTICE.md $(PKG_BUILD_DIR)/root/usr/share/doc/luci-theme-prism/
endef

define Package/luci-theme-prism/prerm
#!/bin/sh
[ -z "$${IPKG_INSTROOT}" ] || exit 0
[ "$${PKG_UPGRADE:-0}" != 1 ] || exit 0
if [ "$$(uci -q get luci.main.mediaurlbase)" = '/luci-static/prism' ]; then
	uci set luci.main.mediaurlbase='/luci-static/bootstrap'
fi
uci -q delete luci.themes.Prism
uci commit luci
exit 0
endef

include $(firstword $(wildcard ../../luci.mk $(TOPDIR)/feeds/luci/luci.mk))

# call BuildPackage - OpenWrt buildroot signature
