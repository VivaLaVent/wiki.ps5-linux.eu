---
title: Wi-Fi
sidebar_position: 5
description: "The PS5's Wi-Fi chips under Linux: the IW620 driver, setting up Wi-Fi before the first boot, and fixes when it doesn't connect or drops."
hardware: [original, slim, pro]
applies_to: all
---

# Wi-Fi

## Quick answers

| Problem | Do this |
| --- | --- |
| No Wi-Fi device on an original PS5 | The IW620 needs its own driver, see [The IW620 driver](#install) |
| No Wi-Fi after a kernel update | Run `sudo ./install.sh` again, see [After a kernel update](#after-a-kernel-update) |
| No Wi-Fi after a warm reboot | Power off and start with the loader. PS5 Bazzite Deck repairs it by itself from v2.8 |
| Bazzite: no networks listed | Remove `/etc/NetworkManager/conf.d/iwd.conf`, then `sudo systemctl restart NetworkManager` <a id="bazzite-no-wi-fi-networks"></a> |
| A hidden network doesn't show up | `ext_scan=2` on the `options moal` line; the default in current drivers and PS5 Bazzite Deck from v2.8 |
| The interface shows as unavailable | `nmcli radio wifi on; rfkill unblock wifi` |
| Slow, dropping, or stuck under load | Power saving off: `ps_mode=0`, see [Drops under load](#driver-stuck-under-sustained-load) |
| The driver loads but no interface appears | [Firmware in the wrong place](#adapter-shows-as-unclaimed-the-driver-loads-but-never-binds) |
| Connects only after switching Wi-Fi off and on once | Known right after a first start; do that once |

## Which chip

| Chip | Consoles | Driver |
| --- | --- | --- |
| Marvell IW620 (`1b4b:2b56`) | Original PS5, some Slims | NXP `mwifiex` patched for the PS5, not in the stock kernel |
| MediaTek MT7961 (`14c3:7961`) | Most Slims | `mt7921e`, in every current kernel |
| MediaTek MT7925 (`14c3:7925`) | PS5 Pro | `mt7925e`, in every current kernel |

Check yours on [Console models and chips](/getting-started/hardware#console-models-and-chips). PS5 Bazzite Deck, the `linux-ps5` package and rmuxnet's kernel include the IW620 driver; nothing to install there.

## The IW620 driver {#install}

```bash
git clone https://github.com/ps5-linux/ps5-linux-mwifiex
cd ps5-linux-mwifiex
sudo ./install.sh
```

Uninstall: `sudo ./install.sh uninstall`. A working driver logs `WLAN FW is active` and `Driver loaded successfully`; `nmcli device status` lists the interface (usually `wlp64s0f7`).

### After a kernel update {#after-a-kernel-update}

`install.sh` builds for the running kernel: run `sudo ./install.sh` again after every kernel update.

### Install fails on Arch

Install the kernel headers first; they sit next to the kernel package and on the [ps5-linux-patches releases](https://github.com/ps5-linux/ps5-linux-patches/releases):

```bash
sudo pacman -U linux-bin/linux-ps5-headers_*.pkg.tar.zst
```

If the build still fails, the headers landed under `/usr/usr/include`:

```bash
sudo cp -r /usr/usr/include/* /usr/include/
```

### Package installs on Fedora and Debian

- **`Depends: linux-ps5 (= X.Y.Z)`:** the driver package is built for one kernel version; install that version. Check first whether the kernel already has the driver: `dmesg | grep -iE 'moal|mlan|mwifiex'`.
- **`kernel built on gcc 13, using gcc 15`:** update the kernel package too.
- **rpm-ostree images from the official builder:**

```bash
sudo dnf upgrade -y linux-ps5 --setopt=gpgcheck=0
sudo rpm-ostree install ps5-linux-mwifiex ps5-linux-tools
```

## The driver loads but no interface appears {#adapter-shows-as-unclaimed-the-driver-loads-but-never-binds}

`lspci` shows the chip as UNCLAIMED and `dmesg` stops after `Attach mlan adapter operations`: the firmware is in the wrong folder.

```bash
find /lib -iname "pcieuartiw620_combo_v1.bin"
```

```bash
sudo mkdir -p /lib/firmware/nxp
sudo mv /lib/pcieuartiw620_combo_v1.bin /lib/firmware/nxp/
```

Reload the driver; the interface appears at once.

## Drops under load {#driver-stuck-under-sustained-load}

`dmesg` shows a reset loop:

```text
num_cmd_timeout = 1
woal_reset_adma: ADMA reset failed (value:97)
woal_reset_intf: get bss info failed
Block woal_cfg80211_deauthenticate in abnormal driver state
PCIe In-band Reset Fail
```

Load the driver with `ps_mode=0` instead of `ps_mode=2` on its `options moal` line. PS5 Bazzite Deck ships that (`ps5-perf wifi` sets it again). With two `options moal` files in `/etc/modprobe.d/`, modprobe merges both: keep one.

## Wi-Fi before the first start

Without Ethernet: write the connection into the flashed drive from another Linux PC. Replace `/dev/sdX1` with its root partition:

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

## By hand

<<<<<<< ours
Load the modules:
=======
```bash
nmcli device status
```

## First checks

1. `nmcli device` lists the Wi-Fi device; on PS5 Bazzite Deck, `ps5-report` names the chip on its **Wi-Fi** line.
2. No Wi-Fi device on an IW620 console: the chip needs its out-of-tree driver, which PS5 Bazzite Deck includes. After a warm reboot, `ps5-wifi-repair` reloads it there, and a power off fixes it for sure.
3. Slow or dropping Wi-Fi: PS5 Bazzite Deck turns power saving off by default (`ps5-perf wifi` switches it off again); on other images, see [Driver stuck under sustained load](#driver-stuck-under-sustained-load).

## Arch: install fails (missing headers or wrong headers path)

When `./install.sh` fails on an Arch-based image, install the kernel headers first:
>>>>>>> theirs

```bash
sudo modprobe cfg80211
sudo insmod ./mlan.ko
sudo insmod ./moal.ko \
  fw_name=nxp/pcieuartiw620_combo_v1.bin \
  pcie_int_mode=1 drv_mode=1 cfg80211_wext=4 sta_name=mlan \
  ext_scan=2 auto_fw_reload=0 wifi_reset_config=0 \
  sched_scan=0 ps_mode=2 auto_ds=2 amsdu_disable=1
```

Build from source:

```bash
git clone https://github.com/nxp-imx/mwifiex.git && cd mwifiex
git checkout lf-6.18.2_1.0.0
git apply ../ps5-iw620.patch
make CONFIG_OBJTOOL=
```
