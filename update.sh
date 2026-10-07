#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
[ "$(id -u)" = 0 ] || { echo 'Run as root.' >&2; exit 1; }
if [ -f /usr/lib/opkg/info/luci-theme-prism.control ] || [ -f /lib/apk/packages/luci-theme-prism.list ]; then
 echo 'Prism is package-managed. Use the package manager.' >&2; exit 1
fi
[ -d /www/luci-static/prism ] && [ -d /usr/share/ucode/luci/template/themes/prism ] || { echo 'Prism not found. Use install.sh instead.' >&2; exit 1; }
for source in htdocs/luci-static/prism/base.css htdocs/luci-static/prism/fonts.css htdocs/luci-static/prism/components.css htdocs/luci-static/prism/appearance.css htdocs/luci-static/prism/compat.css htdocs/luci-static/prism/motion.js htdocs/luci-static/prism/navigation.js htdocs/luci-static/prism/theme.js htdocs/luci-static/prism/logo.svg htdocs/luci-static/resources/menu-prism.js ucode/template/themes/prism/header.ut ucode/template/themes/prism/footer.ut; do
 [ -s "$source" ] || { echo "Missing file: $source" >&2; exit 1; }
done
backup="$(mktemp -d /tmp/prism-backup.XXXXXX)"
mkdir -p "$backup/media" "$backup/templates"
cp -R /www/luci-static/prism/. "$backup/media/"
cp -R /usr/share/ucode/luci/template/themes/prism/. "$backup/templates/"
cp /www/luci-static/resources/menu-prism.js "$backup/menu-prism.js"
cat > "$backup/restore.sh" <<'RESTORE'
#!/bin/sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cp -R media/. /www/luci-static/prism/
cp -R templates/. /usr/share/ucode/luci/template/themes/prism/
cp menu-prism.js /www/luci-static/resources/menu-prism.js
echo 'Previous Prism restored. Press Ctrl+F5 in LuCI.'
RESTORE
restore_on_error() {
 echo "Update failed. Restoring from $backup" >&2
 sh "$backup/restore.sh"
}
trap 'restore_on_error; exit 1' HUP INT TERM
if cp -R htdocs/luci-static/prism/. /www/luci-static/prism/ &&
 cp htdocs/luci-static/resources/menu-prism.js /www/luci-static/resources/menu-prism.js &&
 cp ucode/template/themes/prism/*.ut /usr/share/ucode/luci/template/themes/prism/; then
 trap - HUP INT TERM
 echo 'Prism 0.5.0 updated. Press Ctrl+F5 in LuCI. No reboot required.'
 echo "Rollback: sh $backup/restore.sh"
 echo 'Backup is in /tmp and will be removed on reboot.'
else
 restore_on_error
 exit 1
fi
