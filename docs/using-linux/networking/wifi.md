---
title: Wi-Fi (IW620 / mwifiex)
sidebar_label: Wi-Fi
sidebar_position: 2
description: Install, configure and troubleshoot the PS5's internal Wi-Fi.
---

# Wi-Fi (IW620 / mwifiex)

- **Internal chip:** `40:00.7` Marvell Technology Group Ltd. Device `[1b4b:2b56]` (rev 02)
- **Driver:** NXP mwifiex fork, patched for the PS5's IW620

:::warning[MediaTek chips (most PS5 Slims and the PS5 Pro)]
Some consoles use a MediaTek chip instead of the Marvell IW620 covered on this page: the MT7961 (`14c3:7961`) on most Slims and the MT7925 (`14c3:7925`) on the PS5 Pro. See [Console models and chips](/hardware/overview#console-models-and-chips) for how to check which one you have.

The official ps5-linux kernel config doesn't build the `mt7921e` driver, so these chips don't work on the official images. [PS5 Bazzite Deck](/installation/bazzite-deck) builds it (`CONFIG_MT7921E=m`) and supports MediaTek Wi-Fi and Bluetooth. On other images, use a [USB Wi-Fi adapter](/hardware/usb-storage#usb-network-adapters).
:::

:::tip[Using the package repository?]
The `linux-ps5` kernel package from the [package repository](/advanced/package-repository) already includes this driver, so Wi-Fi works without the install steps below.
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

No Ethernet, but you need Wi-Fi on the first boot? You can add your network credentials from another Linux PC before you plug the USB drive into the PS5. Replace `/dev/sdX1` with the root filesystem partition of the flashed drive.

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

A driver built with `install.sh` is built for the kernel that was running at the time. Run `sudo ./install.sh` again after every kernel update, or Wi-Fi disappears. The `linux-ps5` package from the [package repository](/advanced/package-repository) carries the driver, so it doesn't need this.

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

## Troubleshooting

### Arch: install fails (missing headers or wrong headers path)

If `./install.sh` fails on Arch, first make sure the kernel headers are installed:

```bash
sudo pacman -U linux-bin/linux-ps5-headers_*.pkg.tar.zst
```

The headers package is in the same `linux-bin/` folder as the kernel package. You can also download it from the [ps5-linux-patches releases](https://github.com/ps5-linux/ps5-linux-patches/releases).

If it still fails, you may have hit a known packaging bug that installs the headers to `/usr/usr/include` instead of `/usr/include`. Fix it with:

```bash
sudo cp -r /usr/usr/include/* /usr/include/
```

Confirmed working on a CachyOS (Arch-based) install.

### Adapter shows as UNCLAIMED: the driver loads but never binds

Symptoms: `lspci` shows the Marvell chip, `moal` is listed under kernel modules, but the interface never comes up. `dmesg` shows the driver recognising the card and then giving up silently, without any firmware errors:

```text
Attach moal handle ops, card interface type: 0x207
Enable moal_recv_amsdu_packet
Attach mlan adapter operations.card_type is 0x207.
```

This was a bug in the install script: `install.sh` put the firmware in `/lib/` instead of `/lib/firmware/`, and the kernel only looks in `/lib/firmware/`. Check where the file ended up:

```bash
find /lib -iname "pcieuartiw620_combo_v1.bin"
```

If it is in `/lib/` instead of `/lib/firmware/nxp/`, move it:

```bash
sudo mkdir -p /lib/firmware/nxp
sudo mv /lib/pcieuartiw620_combo_v1.bin /lib/firmware/nxp/
```

Reload the driver and the interface should come up straight away.

### Package manager installs (Fedora/Debian): common failures

If your distro uses the `ps5-linux-mwifiex` package instead of the manual `install.sh` above, two failures come up often.

**Kernel version pin:**

```text
ps5-linux-mwifiex : Depends: linux-ps5 (= 7.1.1) but 7.1.2 is to be installed
```

The mwifiex package requires one exact kernel version. Install the matching `linux-ps5` version instead of upgrading the kernel first. Before fighting the package manager, check whether your kernel already has the driver built in:

```bash
dmesg | grep -iE 'moal|mlan|mwifiex'
```

**Kernel/GCC/pahole mismatch while building:**

```text
warning: kernel built on gcc 13, using gcc 15
```

The toolchain that builds the module must match the one that built the kernel. Don't combine a distro-upgraded GCC with an older prebuilt `linux-ps5` kernel package.

**Confirmed working install (rpm-ostree/Bazzite):**

```bash
sudo dnf upgrade -y linux-ps5 --setopt=gpgcheck=0
sudo rpm-ostree install ps5-linux-mwifiex ps5-linux-tools
sudo systemctl reboot
```

If apt or dnf reports conflicts between cached package files with the same names, use the manual `install.sh` method instead.

### Bazzite: no Wi-Fi networks

Bazzite uses `iwd` as NetworkManager's Wi-Fi backend by default, which doesn't work with the IW620 driver. Switch back to `wpa_supplicant` with `ujust toggle-iwd` (choose "disable iwd"), then run `sudo systemctl restart NetworkManager`. Newer images already include this fix.

### The interface shows as unavailable

The radio is blocked. Turn it on:

```bash
nmcli radio wifi on
rfkill unblock wifi
```

### Two `moal` option files

If the `linux-ps5` package installed a `moal.conf` in `/etc/modprobe.d/` and you also have your own, modprobe merges the `options moal` lines from both. Keep them in sync or remove one.

### Wi-Fi doesn't connect or drops under load

Wi-Fi may need to be turned off and on again after the first boot before it connects. If it drops under load (a known issue), reload the driver:

```bash
sudo modprobe -r moal mlan
sudo modprobe cfg80211
sudo insmod ./mlan.ko
sudo insmod ./moal.ko fw_name=nxp/pcieuartiw620_combo_v1.bin pcie_int_mode=1 drv_mode=1 cfg80211_wext=4 sta_name=mlan ext_scan=1 auto_fw_reload=0 wifi_reset_config=0 sched_scan=0 ps_mode=2 auto_ds=2 amsdu_disable=1
```

### Driver stuck under sustained load

If `dmesg` shows a pattern like this during heavy traffic, the driver is stuck in a reset loop:

```text
num_cmd_timeout = 1
woal_reset_adma: ADMA reset failed (value:97)
woal_reset_intf: get bss info failed
Block woal_cfg80211_deauthenticate in abnormal driver state
PCIe In-band Reset Fail
```

Power-save cycling is the suspected trigger. Replace `ps_mode=2` with **`ps_mode=0`** (power saving off) in the `insmod` command above. Users report that this holds up under sustained load where `ps_mode=2` did not.
