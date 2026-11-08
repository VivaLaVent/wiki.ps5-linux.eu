---
title: Wi-Fi
sidebar_position: 5
description: "The PS5's Wi-Fi chips under Linux: the IW620 driver, setting up Wi-Fi before the first boot, and fixes when it doesn't connect or drops."
hardware: [original, slim, pro]
applies_to: all
---

# Wi-Fi

Most original PS5s have a Marvell IW620 Wi-Fi/Bluetooth chip (`40:00.7`, PCI ID `1b4b:2b56`). Its Linux driver is an NXP `mwifiex` fork patched for the PS5, which is not part of the stock kernel; this page covers getting it in and keeping it working, and the fixes when Wi-Fi misbehaves.

:::warning[MediaTek chips (most PS5 Slims and the PS5 Pro)]
Some consoles use a MediaTek chip instead of the Marvell IW620: the MT7961 (`14c3:7961`) on most Slims and the MT7925 (`14c3:7925`) on the PS5 Pro. See [Console models and chips](/getting-started/hardware#console-models-and-chips) for how to check which one you have.

Both work with the drivers already in the kernel (`mt7921e` for the Slim, `mt7925e` for the Pro), and every current kernel builds them, the official one included; the driver steps below don't apply to them. Their Bluetooth is a different story, see [Bluetooth](/troubleshooting/bluetooth). On an old kernel without the drivers, use a [USB Wi-Fi adapter](/getting-started/drives#usb-network-adapters).
:::

:::tip[Kernels that bring the driver along]
The `linux-ps5` kernel package from the [package repository](/post-install/package-repository) includes this driver, and so does [rmuxnet's kernel](/post-install/kernel#install-rmuxnets-release): the driver is built with the kernel, and `install.sh` (and `build.sh`) write `/etc/modprobe.d/ps5-iw620.conf` and copy the firmware from the boot partition. On both, Wi-Fi works without the install steps below.
:::

## Install

```bash
git clone https://github.com/ps5-linux/ps5-linux-mwifiex
cd ps5-linux-mwifiex
sudo ./install.sh
```

To uninstall:

```bash
sudo ./install.sh uninstall
```

## Load the driver manually

```bash
sudo modprobe cfg80211
sudo insmod ./mlan.ko
sudo insmod ./moal.ko \
  fw_name=nxp/pcieuartiw620_combo_v1.bin \
  pcie_int_mode=1 drv_mode=1 cfg80211_wext=4 sta_name=mlan \
  ext_scan=1 auto_fw_reload=0 wifi_reset_config=0 \
  sched_scan=0 ps_mode=2 auto_ds=2 amsdu_disable=1
```

## Build from source

```bash
git clone https://github.com/nxp-imx/mwifiex.git && cd mwifiex
git checkout lf-6.18.2_1.0.0
git apply ../ps5-iw620.patch
make CONFIG_OBJTOOL=
```

## Set up Wi-Fi before the first boot

Without Ethernet, you can still have Wi-Fi on the first boot by writing the connection into the image from another Linux PC before the drive goes into the PS5. Replace `/dev/sdX1` with the root filesystem partition of the flashed drive.

```bash
# Mount the root filesystem partition of the flashed USB drive
MNT=$(mktemp -d)
sudo mount /dev/sdX1 "$MNT"

# Create the NetworkManager connection file
sudo install -d -m 700 "$MNT/etc/NetworkManager/system-connections"
sudo tee "$MNT/etc/NetworkManager/system-connections/wifi.nmconnection" >/dev/null <<'EOF'
[connection]
id=wifi
type=wifi
autoconnect=true

[wifi]
mode=infrastructure
ssid=YOUR_SSID_HERE

[wifi-security]
key-mgmt=wpa-psk
psk=YOUR_PASSWORD_HERE

[ipv4]
method=auto

[ipv6]
addr-gen-mode=stable-privacy
method=auto
EOF

sudo chmod 600 "$MNT/etc/NetworkManager/system-connections/wifi.nmconnection"
sudo chown root:root "$MNT/etc/NetworkManager/system-connections/wifi.nmconnection"
sudo umount "$MNT"
```

## After a kernel update

`install.sh` builds the driver for the kernel that is running at the time. After a kernel update, run `sudo ./install.sh` again, or there is no Wi-Fi. The `linux-ps5` package from the [package repository](/post-install/package-repository) and rmuxnet's kernel carry the driver, so they don't need this.

## Check that it works

A working driver prints these lines in `dmesg`:

```text
WLAN FW is active
Driver loaded successfully
```

Then check the connection. The interface is usually called `wlp64s0f7`:

```bash
nmcli device status
```

## First checks

1. `nmcli device` lists the Wi-Fi device; on PS5 Bazzite Deck, `ps5-report` names the chip on its **Wi-Fi** line.
2. No Wi-Fi device on an IW620 console: the chip needs its out-of-tree driver, which PS5 Bazzite Deck includes. After a warm reboot, `ps5-wifi-repair` reloads it there, and a power off fixes it for sure.
3. Slow or dropping Wi-Fi: PS5 Bazzite Deck turns power saving off by default (`ps5-perf wifi` switches it off again); on other images, see [Driver stuck under sustained load](#driver-stuck-under-sustained-load).

## Arch: install fails (missing headers or wrong headers path)

When `./install.sh` fails on an Arch-based image, install the kernel headers first:

```bash
sudo pacman -U linux-bin/linux-ps5-headers_*.pkg.tar.zst
```

The headers package sits next to the kernel package in `linux-bin/`, and is also on the [ps5-linux-patches releases](https://github.com/ps5-linux/ps5-linux-patches/releases).

If the build still fails, a packaging bug in some header packages put the files under `/usr/usr/include` instead of `/usr/include`. Copy them where the build looks:

```bash
sudo cp -r /usr/usr/include/* /usr/include/
```

## Adapter shows as UNCLAIMED: the driver loads but never binds

Symptoms: `lspci` lists the Marvell chip, `moal` is loaded, but no interface appears, and `dmesg` shows the driver finding the card and then stopping without a firmware error:

```text
Attach moal handle ops, card interface type: 0x207
Enable moal_recv_amsdu_packet
Attach mlan adapter operations.card_type is 0x207.
```

The firmware is in the wrong place. An older `install.sh` copied it to `/lib/` instead of `/lib/firmware/nxp/`, and the kernel only looks under `/lib/firmware/`. Find it:

```bash
find /lib -iname "pcieuartiw620_combo_v1.bin"
```

Move it if needed:

```bash
sudo mkdir -p /lib/firmware/nxp
sudo mv /lib/pcieuartiw620_combo_v1.bin /lib/firmware/nxp/
```

Reload the driver; the interface appears at once.

## Package manager installs (Fedora/Debian): common failures

With the `ps5-linux-mwifiex` package instead of the manual `install.sh`, two things go wrong regularly.

**Kernel version pin:**

```text
ps5-linux-mwifiex : Depends: linux-ps5 (= X.Y.Z) but X.Y.W is to be installed
```

The driver package is built against one exact kernel version. Install that `linux-ps5` version rather than upgrading the kernel first. Before you fight the package manager, check whether the kernel already has the driver built in:

```bash
dmesg | grep -iE 'moal|mlan|mwifiex'
```

**Compiler mismatch while building:**

```text
warning: kernel built on gcc 13, using gcc 15
```

The module has to be built with the same toolchain as the kernel. A distro upgrade that brings a newer GCC breaks the build against an older prebuilt `linux-ps5`; update the kernel package as well.

**rpm-ostree/Bazzite images from the official builder:**

```bash
sudo dnf upgrade -y linux-ps5 --setopt=gpgcheck=0
sudo rpm-ostree install ps5-linux-mwifiex ps5-linux-tools
sudo systemctl reboot
```

If apt or dnf complains about cached package files with the same names, fall back to the manual `install.sh` method.

## Bazzite: no Wi-Fi networks

Older Bazzite builds used `iwd` as NetworkManager's Wi-Fi backend, which doesn't work with the IW620 driver. Current Bazzite uses `wpa_supplicant` again and removes the old setting by itself (its `ujust toggle-iwd` is gone). If an install still has `/etc/NetworkManager/conf.d/iwd.conf`, remove it and run `sudo systemctl restart NetworkManager`.

## The interface shows as unavailable

The radio is blocked. Turn it on:

```bash
nmcli radio wifi on
rfkill unblock wifi
```

## Two `moal` option files

If the `linux-ps5` package installed a `moal.conf` in `/etc/modprobe.d/` and you also have your own, modprobe merges the `options moal` lines from both. Keep them in sync or remove one.

## Wi-Fi doesn't connect or drops under load

Right after the first boot the connection sometimes only comes up after Wi-Fi is switched off and on once. If it drops under load, reload the driver:

```bash
sudo modprobe -r moal mlan
sudo modprobe cfg80211
sudo insmod ./mlan.ko
sudo insmod ./moal.ko fw_name=nxp/pcieuartiw620_combo_v1.bin pcie_int_mode=1 drv_mode=1 cfg80211_wext=4 sta_name=mlan ext_scan=1 auto_fw_reload=0 wifi_reset_config=0 sched_scan=0 ps_mode=2 auto_ds=2 amsdu_disable=1
```

## Driver stuck under sustained load

When `dmesg` shows this pattern during heavy traffic, the driver is caught in a reset loop:

```text
num_cmd_timeout = 1
woal_reset_adma: ADMA reset failed (value:97)
woal_reset_intf: get bss info failed
Block woal_cfg80211_deauthenticate in abnormal driver state
PCIe In-band Reset Fail
```

The chip's power saving seems to set it off. Load the driver with **`ps_mode=0`** (power saving off) instead of `ps_mode=2`: with that, the connection holds under sustained load. PS5 Bazzite Deck ships this setting.
