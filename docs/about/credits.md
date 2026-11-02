---
title: Credits
sidebar_position: 1
description: The people behind ps5-linux and this wiki.
---

# Credits

ps5-linux is a community project. Core contributors:

| Person | Contribution |
| --- | --- |
| [theflow](https://github.com/TheOfficialFloW) | ps5-linux-loader, ps5-linux-patches, ps5-linux-tools |
| [c0w](https://github.com/c0w-ar) | ps5-linux-loader, xHCI Salina driver and btusb fixes, EMC reverse engineering for the fan, LED and buzzer drivers |
| [resulknad](https://github.com/resulknad) | ps5-linux-image |
| [rmuxnet](https://github.com/rmuxnet) | PS5 Ethernet driver (`mts`) and its speed and IPv6 fixes, VCN hardware video, `ahci_salina` Blu-ray AHCI driver, LED, buzzer and fan drivers, [ps5ctl](https://github.com/rmuxnet/ps5ctl) |
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

## Upstreamed kernel and Mesa changes

- [drm/amd: fix DCN 2.01 check](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/drivers/gpu/drm/amd/display/dc?id=39f44f54afa58661ecae9c27e15f5dbce2372892)
- [amd/addrlib: Add more GFX1013 GPUs](https://gitlab.freedesktop.org/mesa/mesa/-/commit/44bed00b8bbcb1825e2c920cf1a828efdc72b1f1)

## About this wiki

This wiki is based on the [PS5 Linux Guide](https://guide.rmux.eu/) by [rmuxnet](https://github.com/rmuxnet) and its contributors, including [nothinglikeuuuuu](https://github.com/nothinglikeuuuuu), released under the MIT License. Its content has been restructured and edited for this site.

Community project, not affiliated with Sony Interactive Entertainment.

## Community

- [Discord](https://discord.gg/ps5linux): help, tips, development and bug reports
- [Telegram](https://t.me/ps5linux): kernel builds and updates
