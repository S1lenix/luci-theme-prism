#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
case "${1:-}" in ""|--activate) ;; *) echo 'Usage: sh install.sh [--activate]' >&2; exit 2;; esac
[ "$(id -u)" = 0 ] || { echo 'Run as root.' >&2; exit 1; }
if [ -f /usr/lib/opkg/info/luci-theme-prism.control ] || [ -f /lib/apk/packages/luci-theme-prism.list ]; then
 echo 'Prism is package-managed. Use the package manager.' >&2; exit 1
fi
[ -f /usr/share/ucode/luci/template/themes/bootstrap/header.ut ] || { echo 'Requires modern ucode LuCI with Bootstrap installed.' >&2; exit 1; }
[ -d /www/luci-static/resources ] && [ -f /etc/config/luci ] || { echo 'LuCI not found.' >&2; exit 1; }
for target in /www/luci-static/prism /usr/share/ucode/luci/template/themes/prism /www/luci-static/resources/menu-prism.js; do
 [ ! -e "$target" ] || { echo "Already exists: $target. Remove the previous installation first." >&2; exit 1; }
done
for source in htdocs/luci-static/prism/base.css htdocs/luci-static/prism/fonts.css htdocs/luci-static/prism/components.css htdocs/luci-static/prism/appearance.css htdocs/luci-static/prism/compat.css htdocs/luci-static/prism/motion.js htdocs/luci-static/prism/navigation.js htdocs/luci-static/prism/theme.js htdocs/luci-static/prism/logo.svg htdocs/luci-static/resources/menu-prism.js ucode/template/themes/prism/header.ut ucode/template/themes/prism/footer.ut; do
 [ -s "$source" ] || { echo "Missing file: $source" >&2; exit 1; }
done
mkdir -p /www/luci-static/prism /usr/share/ucode/luci/template/themes/prism
cp -R htdocs/luci-static/prism/. /www/luci-static/prism/
cp htdocs/luci-static/resources/menu-prism.js /www/luci-static/resources/menu-prism.js
cp ucode/template/themes/prism/*.ut /usr/share/ucode/luci/template/themes/prism/
uci set luci.themes.Prism='/luci-static/prism'
if [ "${1:-}" = '--activate' ]; then
 uci -q get luci.main.mediaurlbase > /etc/luci-prism-previous-theme || printf '%s\n' '/luci-static/bootstrap' > /etc/luci-prism-previous-theme
 uci set luci.main.mediaurlbase='/luci-static/prism'
fi
uci commit luci
echo 'Installed: LuCI > System > System > Language and Style > Prism.'
echo 'Reload LuCI with Ctrl+F5. No service restart or router reboot is required.'
