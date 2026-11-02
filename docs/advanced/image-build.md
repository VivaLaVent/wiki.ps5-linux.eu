---
title: How the PS5 Bazzite Deck image is built
sidebar_label: Building an image
sidebar_position: 4
description: What a PS5 image builder has to change in the kernel config and which patches it applies, using PS5 Bazzite Deck as the worked example.
---

# How the PS5 Bazzite Deck image is built

[PS5 Bazzite Deck](/installation/bazzite-deck) is built with the official [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) builder, a kernel from Linux v7.3 plus rmuxnet's 7.3 patch set, and its own patches on top. This page is for anyone making an image: the kernel config changes it needs, the patch order, and the upstream repositories it tracks. Users don't need any of it.

**Credits:** Dasloh (suspend-to-idle, `ps5-linux-patches` PR #4), the ps5-linux project for the builder and the kernel.

:::info[Patch base]
Linux v7.3 plus [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) `meower` at commit `baee34d`, then the image's patches in the order of [`build.sh`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/build.sh). Each release ships a `VERSIONS.md` with the exact pins and a `local-changes.diff` with the changes to the builder.
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
| `CONFIG_MT7921E` | `m` | MediaTek Wi-Fi on the Slim (the official config has it since 30 October 2026) |
| `CONFIG_USB_AUTOSUSPEND_DELAY` | `-1` | USB never sleeps: the Bluetooth chips and the Salina xHCI don't survive it |
| `CONFIG_LOG_BUF_SHIFT` | `20` | 1 MiB boot log, so the early HDMI chip and Pro firmware lines don't scroll out of reports |
| `CONFIG_PS5_GPUFREQ` | not set | rmuxnet's GPU clock driver, replaced by upstream #66's governor |
| `CONFIG_LOGITECH_FF` and the other Logitech `_FF` options | `y` | Wheel force feedback |

## Patch order

The order matters: later patches are written against the tree state the earlier ones leave. Grouped as `build.sh` applies them:

1. **Builder and Wi-Fi driver:** the out-of-tree IW620 driver gets its kernel 7.2 and 7.3 compatibility patches, and the builder mounts the patches directory so the VCN firmware is found.
2. **Base kernel:** `linux.patch` from `meower`, with `ps5-linux-patches` PR #4 (suspend-to-idle) applied to the patch set first.
3. **Bluetooth:** MediaTek endpoint fix.
4. **HDMI:** upstream HDR/SCDC/hotplug port, re-arm, output fixes, modes, debug log, link lock, CEC, sleep mute, SCDC Source Version, USB-C DP, RGB range, EDID fallback and keep, VERDE game content, session switch, RGB range encoding, USB-C DP opt-in. Explained on [HDMI chip](/hardware/hdmi).
5. **Fan and GPU overlay:** hwmon fan driver (firmware mode by default, `pwm1_enable` `3`, since v2.0.1 with upstream's numbering), `gpu_busy_percent` and a temperature for overlays. See [Fan control](/hardware/fan#hwmon-driver).
6. **VRR and FRL:** VRR, its stock-setup, follow-guard, 48 Hz floor and HDMI-only rules, the open-ended `VRRmax` and HF-SCDB range (v2.0.1); 4K120 over FRL and its guard; the 100 Hz test modes; SCDC `TMDS_Config`.
7. **PS5 Pro:** GPU (#58), Bluetooth (with the cold-boot retry since v2.0.1), no frequency drivers, upstream #66, GPU telemetry (v2.0.1). See [PS5 Pro](/hardware/ps5-pro).
8. **IW620 LE reconnect.**

The exact list with one-line descriptions is in [`build.sh`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/build.sh), section 3; every patch file starts with a description of what it does and why.

## Files baked into the image

Not kernel changes, but an image needs them too: a stable MAC for NetworkManager on the IW620, udev rules that keep the Bluetooth chips and the Salina xHCI powered, the `DefaultDependencies=no` drop-in for `ps5-stage-firmware.service` (see [Modules or sysctl settings not loading](/troubleshooting/modules-not-loading)), the Linux-only Bluetooth address and connectable services (see [Bluetooth](/using-linux/bluetooth)), `hidp` loaded at boot, the warm-reboot units (see [Restart straight into Linux](./warm-reboot.md)), and the Pro firmware staging (see [PS5 Pro](/hardware/ps5-pro#gpu-firmware)). All under [`files/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/v2.0.1/files).

## Upstream repositories to track

| Repository | What it carries |
| --- | --- |
| [ps5-linux/ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches) | The official kernel patches (7.2.3, a package per commit): Pro GPU, fan curve, HDMI work, VCN |
| [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) | `meower` at `baee34d` is the 7.3 port the image builds on. His default branch has moved on to 7.3.1 with the fan curve on by default, reworked clock drivers, the Bluetooth fixes merged and `build.sh`, see [Kernel setup](/advanced/kernel#what-is-where) |
| [Slip-Up/ps5-linux-patches](https://github.com/Slip-Up/ps5-linux-patches) | Slip's HDMI work: native FRL, ALLM, modes |
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

The output lands in `~/ps5-build-7.3/output/`.
