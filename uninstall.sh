#!/bin/sh
set -eu
[ "$(id -u)" = 0 ] || { echo 'Run as root.' >&2; exit 1; }
if [ -f /usr/lib/opkg/info/luci-theme-prism.control ] || [ -f /lib/apk/packages/luci-theme-prism.list ]; then
 echo 'Prism is package-managed. Use the package manager.' >&2; exit 1
fi
previous='/luci-static/bootstrap'
if [ -f /etc/luci-prism-previous-theme ]; then
 candidate="$(cat /etc/luci-prism-previous-theme)"
 case "$candidate" in /luci-static/prism) ;; /luci-static/*) previous="$candidate" ;; esac
fi
if [ "$(uci -q get luci.main.mediaurlbase || true)" = '/luci-static/prism' ]; then
 uci set luci.main.mediaurlbase="$previous"
fi
uci -q delete luci.themes.Prism || true
uci commit luci
# Only this theme's fixed installation paths are removed.
rm -rf /www/luci-static/prism /usr/share/ucode/luci/template/themes/prism
rm -f /www/luci-static/resources/menu-prism.js /etc/luci-prism-previous-theme
echo 'Prism theme removed. Reload LuCI with Ctrl+F5.'
