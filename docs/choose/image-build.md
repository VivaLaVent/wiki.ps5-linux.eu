---
title: How the PS5 Bazzite Deck image is built
sidebar_label: PS5 Bazzite Deck
sidebar_position: 2
description: What a PS5 image builder has to change in the kernel config and which patches it applies, using PS5 Bazzite Deck as the worked example.
hardware: [original, slim, pro]
applies_to: not-bazzite-deck
---

# How the PS5 Bazzite Deck image is built

[PS5 Bazzite Deck](/choose/bazzite-deck) has two parts: a kernel package, built with the official [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) builder from a recent stable kernel, rmuxnet's PS5 patch set and its own patches on top; and a bootc image, Bazzite's Steam Deck image with that kernel, the PS5 services and its own Vulkan driver (RADV) build. Users don't need any of it.

:::info[Patch base]
The stable kernel named in `build.sh` (`KERNEL_TAG`), plus [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) at a pinned commit, then the image's patches in the order of [`patches/series`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/patches/series). Each release ships a `VERSIONS.md` with the exact pins and a `local-changes.diff` with the changes to the builder.
:::

## Kernel config changes

Applied to the patch set's `.config` before the build:

| Option | Value | Why |
| --- | --- | --- |
| `CONFIG_SUSPEND` | `y` | Suspend-to-idle |
| `CONFIG_LSM` | `landlock,lockdown,yama,integrity,apparmor,bpf` | [Game Mode](/post-install/kernel#build-a-kernel-for-bazzite-game-mode) |
| `CONFIG_DEBUG_INFO_BTF` | `y` | [Game Mode](/post-install/kernel#build-a-kernel-for-bazzite-game-mode) |
| `CONFIG_MODULE_ALLOW_BTF_MISMATCH` | `y` | Hotfix kernels keep loading release modules |
| `CONFIG_MT7921E` | `m` | MediaTek Wi-Fi on the Slim (the official config has it now too) |
| `CONFIG_USB_AUTOSUSPEND_DELAY` | `-1` | USB never sleeps: the Bluetooth chips and the Salina xHCI don't survive it |
| `CONFIG_LOG_BUF_SHIFT` | `20` | 1 MiB boot log, so the early HDMI chip and Pro firmware lines don't scroll out of reports |
| `CONFIG_PS5_GPUFREQ` | not set | rmuxnet's GPU clock driver, replaced by the upstream governor |
| `CONFIG_LOGITECH_FF` and the other Logitech `_FF` options | `y` | Wheel force feedback |
| `CONFIG_NF_CONNTRACK_NETBIOS_NS` | `m` | The helper of firewalld's samba-client service, which Fedora's default zone has; without it the firewall doesn't start |

## Patch order

The order matters: later patches are written against the tree state the earlier ones leave. [`build.sh`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/build.sh) first takes the out-of-tree IW620 Wi-Fi driver from ps5-linux-mwifiex at a pinned commit, with that repository's own patches in its order and `ext_scan=2` for hidden networks, then applies rmuxnet's `linux.patch` and the files in [`patches/series`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/patches/series) in this order:

1. **Suspend-to-idle:** Dasloh's pull request.
2. **Display:** the FLAVA3 and VERDE display stack: 4K120 over FRL, 1440p, VRR. Explained on [Display and HDMI](/troubleshooting/display).
3. **HDMI modes:** 100 Hz and VERDE 1440p120 without an option, FLAVA3's manual timing setup for other EDID modes.
4. **GPU:** the thermal GPU clock governor.
5. **Fan:** the console's firmware control on Sony's own table by default, with an 80 °C target (`ps5_fan.target=`), with the driver's quiet table only for the kernel curve, manual and full speed, and no full speed forced at 90 °C in firmware mode. A quiet table older releases left in the console is repaired. See [Fan control](/troubleshooting/fan#hwmon-driver).
6. **PS5 Pro:** Bluetooth and the CPU clock. See [PS5 Pro](/troubleshooting/ps5-pro).
7. **MediaTek Bluetooth:** no ISO interface setup.
8. **IW620 Bluetooth:** the repeated link key request and host address resolution, from the official patches. See [Bluetooth](/troubleshooting/bluetooth#iw620-marvell).
9. **Display updates:** triple-buffer flags cleared before full updates, from the official patches.

Every patch file starts with a description of what it does and why.


## Files baked into the image

Not kernel changes, but an image needs them too: a stable MAC for NetworkManager on the IW620, udev rules that keep the Bluetooth chips and the Salina xHCI powered, the `DefaultDependencies=no` drop-in for `ps5-stage-firmware.service` (see [Modules or sysctl settings not loading](/troubleshooting/error-messages#modules-or-sysctl-settings-not-loading)), the Linux-only Bluetooth address and connectable services (see [Bluetooth](/troubleshooting/bluetooth)), `hidp` loaded at boot, the warm-reboot units (see [Warm reboots](/post-install/warm-reboot)), and the Pro firmware staging (see [PS5 Pro](/troubleshooting/ps5-pro#gpu-firmware)). All under [`files/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/files).

## Upstream repositories to track

| Repository | What it carries |
| --- | --- |
| [ps5-linux/ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches) | The official kernel patches, a package per commit: Pro GPU and governor, fan curve, HDMI work, VCN |
| [rmuxnet/ps5-linux-patches-1](https://github.com/rmuxnet/ps5-linux-patches-1) | The port to the newer stable kernel the image builds on. His default branch has the fan curve on by default, reworked clock drivers, his Bluetooth patches and `build.sh`, see [Kernel setup](/post-install/kernel#what-is-where) |
| [Slip-Up/ps5-linux-patches](https://github.com/Slip-Up/ps5-linux-patches) | The HDMI work: native FRL, ALLM, modes |
| [ps5-linux/ps5-linux-mwifiex](https://github.com/ps5-linux/ps5-linux-mwifiex) | The IW620 Wi-Fi driver |
| [ps5-linux/ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image) | The image builder, including Pro GPU firmware staging |
| [QuartConz/ps5-pro-viola-bluetooth](https://github.com/QuartConz/ps5-pro-viola-bluetooth), [WizGery/ps5-mediatek-fixes](https://github.com/WizGery/ps5-mediatek-fixes) | Pro and Slim Bluetooth |

## The bootc image

[`bootc/Containerfile`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/bootc/Containerfile) starts from `ghcr.io/ublue-os/bazzite-deck:stable` and:

- swaps Bazzite's kernel for the kernel package above, the way Bazzite's own build scripts do;
- installs the PS5 scripts, services and udev rules from `files/`;
- builds RADV, Mesa's Vulkan driver, from Bazzite's Mesa version with Terra's patches plus [Borchev's PS5 Pro patch](/troubleshooting/ps5-pro#radv), 64- and 32-bit, and installs it over Bazzite's;
- checks the result with `bootc container lint`.

`ps5-bootc-sync` then copies the current kernel, initrd and command line to the USB drive's boot partition at every start and shutdown, because the loader knows nothing about bootc.

## Build it yourself

Linux or WSL with Docker, Podman and about 60 GB free. The kernel takes a couple of hours:

```bash
git clone https://github.com/VivaLaVent/ps5-bazzite-deck
cd ps5-bazzite-deck
bash build.sh
```

It writes the `linux-ps5` RPM to `~/ps5-build-7.3/linux-bin/`. Then build the image from the repository root:

```bash
mkdir -p bootc/kernel && cp ~/ps5-build-7.3/linux-bin/linux-ps5-*.rpm bootc/kernel/
podman build -f bootc/Containerfile -t ps5-bazzite-bootc .
```

[`bootc/docs/building.md`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/bootc/docs/building.md) has the details: pinned inputs, signing and how the release workflow builds the disk image.
