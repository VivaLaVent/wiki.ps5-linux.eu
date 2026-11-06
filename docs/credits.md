---
title: Credits
description: The people whose work makes Linux on the PS5 possible, and where to find the community.
hardware: [original, slim, pro]
applies_to: all
---

# Credits

ps5-linux is a community project. Core contributors:

| Person | Contribution |
| --- | --- |
| [theflow](https://github.com/TheOfficialFloW) | ps5-linux-loader, ps5-linux-patches, ps5-linux-tools |
| [c0w](https://github.com/c0w-ar) | ps5-linux-loader, xHCI Salina driver and btusb fixes, EMC reverse engineering for the fan, LED and buzzer drivers |
| [resulknad](https://github.com/resulknad) | ps5-linux-image |
| [rmuxnet](https://github.com/rmuxnet) | PS5 Ethernet driver (`mts`) and its speed and IPv6 fixes, VCN hardware video, `ahci_salina` Blu-ray AHCI driver, LED, buzzer and fan drivers, the hwmon fan curve, `ps5-cpufreq` and `ps5-gpufreq`, the [kernel releases](https://github.com/rmuxnet/ps5-linux-patches-1) with `build.sh` and `install.sh`, [ps5ctl](https://github.com/rmuxnet/ps5ctl), and the [PS5 Linux Guide](https://ps5-linux.com) that parts of this wiki started from |
| [slidybat](https://github.com/slidybat) | Ethernet driver base |
| [buzzer-re](https://github.com/buzzer-re) | ps5-linux-loader, ps5-linux-mwifiex, systemd services in ps5-linux-tools |
| [jspavlick](https://github.com/jspavlick) | Fan max-boost mode in ps5-linux-tools |
| [fail0verflow](https://github.com/fail0verflow) | [prosperous](https://github.com/fail0verflow/prosperous) |
| [flatz](https://github.com/flatz) | HV exploit |
| [cragson](https://github.com/cragson) | HV exploit implementation |
| [john-tornblom](https://github.com/john-tornblom) | [PS5 payload SDK](https://github.com/ps5-payload-dev/sdk) |
| [echostretch](https://github.com/echostretch) | Offsets and testing |
| [kirathenotebook](https://github.com/kirathenotebook) | Beta testing, README |
| 15432 | Testing on the BC-250 |
| [soniciso1](https://github.com/soniciso1) | Loader fork with support for newer firmware |
| [mia / etawen](https://etawen.dev) | Community images, [package repository](/post-install/package-repository) and documentation |
| [WizGery](https://github.com/WizGery/ps5-mediatek-fixes) | MediaTek Bluetooth fixes |
| [QuartConz](https://github.com/QuartConz/ps5-pro-viola-bluetooth) | PS5 Pro Bluetooth |
| [gzimbric](https://github.com/gzimbric/ps5-linux-loader) | First PS5 Pro loader |
| [Wigglez-sudo](https://github.com/Wigglez-sudo/12.xx-linux-loader) | Loader for newer firmware, including the PS5 Pro |
| Lawson | VRR fix and the port of Sony's 4K120 setup over HDMI 2.1 FRL |
| hsgodd | Captures and research on the PS5's HDMI setup |
| Slip | HDR, SCDC, CEC and hotplug patches; native FRL with 4K120 detection and fallback, ALLM |
| Tertium | USB-C display output |
| Dasloh | Suspend-to-idle, Linux-only Bluetooth address, USB power fixes |
| [Borchev](https://github.com/Borchev) | PS5 Pro GPU driver, SMU backend and the GPU clock governor, hwmon fan driver Pro fix, [RADV for the Pro's int8 matrix instructions and compute queue](https://github.com/Borchev/mesa_viola_support) |
| mfoster978 | Found the initrd 4-byte alignment bug for the Pro firmware; Pro firmware dump for more system software versions in the loader; Pro Bluetooth from a cold boot, GPU load in overlays and the Linux-only Bluetooth address on the Pro |
| bizkut | IW620 btusb quirks |
| Daniel Walker | IW620 legacy LE command family quirk |
| Max | IW620 warm-reboot testing |
| Verrek | VRR report and EDID that led to the open-ended VRR maximum fix |
| Shahine, Phat | Fan reports on the PS5 Bazzite Deck pre-releases |
| the_tales, Dvelaren, ciaccio | PS5 Pro testing: loader builds, GPU firmware staging, governor and fan reports |
| AdiX, wfelix | Diagnosis and fix for a controller refused in a loop |
| [NotHavocc](https://github.com/NotHavocc/ps5-hwcon-plugin) | PS5 hardware control plugin |
| [abrocoma](https://github.com/abrocoma) | CachyOS notes: display link lock, DualSense reconnect, boot-to-desktop and systemd ordering fixes |
| [Gilles (VivaLaVent)](https://github.com/VivaLaVent) | [PS5 Bazzite Deck](/choose/bazzite-deck) and this wiki |

## Upstreamed kernel and Mesa changes

- [drm/amd: fix DCN 2.01 check](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/drivers/gpu/drm/amd/display/dc?id=39f44f54afa58661ecae9c27e15f5dbce2372892)
- [amd/addrlib: Add more GFX1013 GPUs](https://gitlab.freedesktop.org/mesa/mesa/-/commit/44bed00b8bbcb1825e2c920cf1a828efdc72b1f1)

## Community

- [Discord](https://discord.gg/ps5linux): help, tips, development and bug reports; PS5 Bazzite Deck help and testing in `#bazzite-problems` and `#bazzite-general`
