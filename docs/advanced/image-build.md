---
title: How the PS5 Bazzite Deck image is built
sidebar_label: Building an image
sidebar_position: 5
description: What a PS5 image builder has to change in the kernel config and which patches it applies, using PS5 Bazzite Deck as the worked example.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# How the PS5 Bazzite Deck image is built

[PS5 Bazzite Deck](/choose/bazzite-deck) is built with the official [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) builder, a recent stable kernel with rmuxnet's PS5 patch set, and its own patches on top. This page is for anyone making an image: the kernel config changes it needs, the patch order, and the upstream repositories it tracks. Users don't need any of it.

:::info[Patch base]
The stable kernel named in the patch set's `.config`, plus [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) at a pinned commit, then the image's patches in the order of [`build.sh`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/build.sh). Each release ships a `VERSIONS.md` with the exact pins and a `local-changes.diff` with the changes to the builder.
:::

## Why Game Mode needs the BPF LSM and kernel BTF

Bazzite's Game Mode starts Steam through the `cardwired` service, which loads an eBPF program. That needs two kernel features:

1. **The BPF LSM.** `CONFIG_BPF_LSM=y` on its own does nothing; `bpf` has to be in `CONFIG_LSM`, or `lsm=landlock,lockdown,yama,integrity,apparmor,bpf` on the command line.
2. **Kernel BTF.** `CONFIG_DEBUG_INFO_BTF=y`, so that `/sys/kernel/btf/vmlinux` exists.

Without them `cardwired` crash-loops with `CardwireEbpfError(LSMNotEnabled)` or `error parsing /sys/kernel/btf/vmlinux`, Gamescope is killed a second after it starts, and after five attempts Bazzite drops to the desktop. The same applies to any image that runs Bazzite's or SteamOS's Game Mode session. Confirmed; this was the reason Bazzite Game Mode never worked on the PS5 before.

`CONFIG_MODULE_ALLOW_BTF_MISMATCH=y` lets a kernel-only hotfix load the release's modules.

## Kernel config changes

Applied to the patch set's `.config` before the build:

| Option | Value | Why |
| --- | --- | --- |
| `CONFIG_LSM` | `landlock,lockdown,yama,integrity,apparmor,bpf` | Game Mode, above |
| `CONFIG_DEBUG_INFO_BTF` | `y` | Game Mode, above |
| `CONFIG_MODULE_ALLOW_BTF_MISMATCH` | `y` | Hotfix kernels keep loading release modules |
| `CONFIG_MT7921E` | `m` | MediaTek Wi-Fi on the Slim (the official config has it now too) |
| `CONFIG_USB_AUTOSUSPEND_DELAY` | `-1` | USB never sleeps: the Bluetooth chips and the Salina xHCI don't survive it |
| `CONFIG_LOG_BUF_SHIFT` | `20` | 1 MiB boot log, so the early HDMI chip and Pro firmware lines don't scroll out of reports |
| `CONFIG_PS5_GPUFREQ` | not set | rmuxnet's GPU clock driver, replaced by the upstream governor |
| `CONFIG_LOGITECH_FF` and the other Logitech `_FF` options | `y` | Wheel force feedback |

## Patch order

The order matters: later patches are written against the tree state the earlier ones leave. Grouped as `build.sh` applies them:

1. **Builder and Wi-Fi driver:** the out-of-tree IW620 driver gets its compatibility patches for the kernel version, and the builder mounts the patches directory so the VCN firmware is found.
2. **Base kernel:** `linux.patch` from rmuxnet's repository, with the suspend-to-idle pull request applied to the patch set first.
3. **Bluetooth:** MediaTek endpoint fix for the Slim.
4. **HDMI:** upstream HDR/SCDC/hotplug port, re-arm, output fixes, modes, debug log, link lock, CEC, sleep mute, SCDC Source Version, USB-C DP, RGB range, EDID fallback and keep, VERDE game content, session switch, RGB range encoding, USB-C DP opt-in. Explained on [HDMI chip](/hardware/hdmi).
5. **Fan and GPU overlay:** hwmon fan driver (firmware mode by default, `pwm1_enable` `3`, with upstream's numbering), `gpu_busy_percent` and a temperature for overlays. See [Fan control](/hardware/fan#hwmon-driver).
6. **VRR and FRL:** VRR, its stock-setup, follow-guard, 48 Hz floor and HDMI-only rules, the open-ended `VRRmax` and HF-SCDB range; 4K120 over FRL and its guard; the 100 Hz test modes; SCDC `TMDS_Config`.
7. **PS5 Pro:** GPU driver and governor (the upstream ports), Bluetooth with the cold-boot retry, no frequency drivers on the Pro, GPU telemetry. See [PS5 Pro](/hardware/ps5-pro).

The exact list with one-line descriptions is in [`build.sh`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/build.sh), section 3; every patch file starts with a description of what it does and why.

:::warning[Not in the image any more: the IW620 legacy LE workaround]
rmuxnet's repository has a change that marks the IW620's extended LE commands as broken so keyboards and mice reconnect. On that chip it stops Bluetooth from finding new devices, because the scan then uses the legacy commands while advertising still uses the extended ones, see [Bluetooth](/hardware/wifi-bluetooth#iw620-marvell). The image dropped it; an image that takes rmuxnet's patch set as is inherits it.
:::

## Files baked into the image

Not kernel changes, but an image needs them too: a stable MAC for NetworkManager on the IW620, udev rules that keep the Bluetooth chips and the Salina xHCI powered, the `DefaultDependencies=no` drop-in for `ps5-stage-firmware.service` (see [Modules or sysctl settings not loading](/troubleshooting/modules-not-loading)), the Linux-only Bluetooth address and connectable services (see [Bluetooth](/hardware/wifi-bluetooth#bluetooth)), `hidp` loaded at boot, the warm-reboot units (see [Restart straight into Linux](/advanced/warm-reboot)), and the Pro firmware staging (see [PS5 Pro](/hardware/ps5-pro#gpu-firmware)). All under [`files/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/files).

## Upstream repositories to track

| Repository | What it carries |
| --- | --- |
| [ps5-linux/ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches) | The official kernel patches, a package per commit: Pro GPU and governor, fan curve, HDMI work, VCN |
| [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) | The port to the newer stable kernel the image builds on. His default branch has the fan curve on by default, reworked clock drivers, his Bluetooth patches and `build.sh`, see [Kernel setup](/advanced/kernel#what-is-where) |
| [Slip-Up/ps5-linux-patches](https://github.com/Slip-Up/ps5-linux-patches) | The HDMI work: native FRL, ALLM, modes |
| [ps5-linux/ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex) | The IW620 Wi-Fi driver |
| [ps5-linux/ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) | The image builder, including Pro GPU firmware staging |
| [QuartConz/ps5-pro-viola-bluetooth](https://github.com/QuartConz/ps5-pro-viola-bluetooth), [WizGery/ps5-mediatek-fixes](https://github.com/WizGery/ps5-mediatek-fixes) | Pro and Slim Bluetooth |

## Build it yourself

Linux or WSL with Docker and about 60 GB free. It takes a couple of hours (kernel compile plus the Bazzite download):

```bash
git clone https://github.com/VivaLaVent/ps5-bazzite-deck
cd ps5-bazzite-deck
bash build.sh
```

The script prints the output folder at the end.

## Next steps

- [Hardware status](/hardware/matrix): what works on each model
- [After installing](/post-install/all-distros)
- [Troubleshooting & help](/troubleshooting/getting-help)
