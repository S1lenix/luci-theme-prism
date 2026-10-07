<img src="htdocs/luci-static/prism/logo.svg" width="64" alt="Prism">

# Prism

[Русский](README.md) | **English**

Prism is an OpenWrt LuCI theme with eight visual styles and smooth animations. Responsive navigation, forms, tables and status indicators share a consistent appearance on desktop and mobile.

[Download](https://github.com/S1lenix/luci-theme-prism/releases/latest) | [Report a bug](https://github.com/S1lenix/luci-theme-prism/issues)

## Styles

| Style | Description |
| --- | --- |
| Light | A light interface with blue accents. |
| Soft | A soft light palette with subtle gradients. |
| Dark | Dark surfaces with colorful accents. |
| Ink | Strong outlines, nearly square shapes and vivid status indicators. |
| Bento | Warm tones, rounded cards and orange accents. |
| Minimal | Simple shapes, thin lines and little decoration. |
| Retro 98 | A Windows 95/98-inspired look with beveled borders and segmented progress bars. |
| Depth | A dark blue palette with shadows and layered surfaces. |

Switch styles using the palette button in the header. Your selection is saved in the browser. Animations respect your system's reduced-motion preference.

## Compatibility

Requires modern LuCI with ucode templates and the Bootstrap theme installed. Older LuCI versions using Lua templates are not supported.

- OpenWrt 25.12 - APK package.
- OpenWrt 24.10 - IPK package.

Router information and available pages come from LuCI. Third-party applications and custom firmware may have layout differences. Use an up-to-date browser.

## Installation

Download the package for your OpenWrt version from [Releases](https://github.com/S1lenix/luci-theme-prism/releases/latest).

**OpenWrt 24.10:** open **System > Software > Upload Package**, select the IPK file and confirm installation.

**OpenWrt 25.12:** not all LuCI versions support uploading third-party APK packages. If the interface reports a signature error, copy the APK file to **/tmp** using WinSCP or SCP and install it over SSH:

```sh
apk add --allow-untrusted /tmp/luci-theme-prism-0.5.0-r1.apk
```

Select **Prism** under **System > System > Language and Style**, save the settings and reload with **Ctrl+F5**. No router reboot is needed.

## Updating

Download a newer package in the same format and install it over the existing version using the same method. For APK, use the new filename in the command. Reload with **Ctrl+F5**.

## Removal

Find **luci-theme-prism** under **System > Software > Installed** and select **Remove**. If Prism is active, removal switches LuCI to Bootstrap. Reload the page.

## Feedback

Report bugs and suggest changes in [Issues](https://github.com/S1lenix/luci-theme-prism/issues). Include your OpenWrt and LuCI versions, selected style and affected page. Attach a screenshot for layout problems.

## License

[Apache-2.0](LICENSE). Third-party credits and font licenses are listed in [NOTICE.md](NOTICE.md).
