---
title: Troubleshooting
sidebar_label: Start here
sidebar_position: 1
description: "How to troubleshoot Linux on the PS5: get in over SSH, collect logs with ps5-report or one command, and find the page for your problem."
hardware: [original, slim, pro]
applies_to: all
---

# Troubleshooting

Most problems leave Linux running behind a black screen or a missing device, so the way in is almost always the same: connect over SSH from another computer, collect the logs, and look up the component that misbehaves. A question on [Discord](https://discord.gg/ps5linux) gets answered quickly when it comes with a log.

## Where to look

| Problem | Page |
| --- | --- |
| Linux doesn't start, an error message, an update or a kernel that fails, a system that needs repairing | [Error messages](/troubleshooting/error-messages) |
| No picture, wrong mode, 120 Hz, 4K120, VRR, HDR, colours | [Display and HDMI](/troubleshooting/display) |
| Games, VRAM, compute units, video encode and decode | [GPU](/troubleshooting/gpu) |
| PS5 Pro: GPU firmware, 36 instead of 60 compute units, games that go black | [PS5 Pro](/troubleshooting/ps5-pro) |
| Wireless networks | [Wi-Fi](/troubleshooting/wifi) |
| Wired networks and USB adapters | [Ethernet](/troubleshooting/ethernet) |
| Controllers, pairing, the Linux-only Bluetooth address | [Bluetooth](/troubleshooting/bluetooth) |
| Fan noise, temperatures | [Fan](/troubleshooting/fan) |
| A USB drive that disconnects or isn't found | [Storage and USB](/troubleshooting/storage) |
| Sound | [Audio](/troubleshooting/audio) |
| Light bar, buzzer, capture cards | [LED, buzzer and capture cards](/troubleshooting/peripherals) |

## Get in over SSH {#ssh}

When the screen stays black, the console is often still running. Connect from a PC on the same network.

### SSH availability by image {#ssh-availability-by-distro}

| Distro | SSH on by default | Root login | Password login |
| --- | --- | --- | --- |
| Ubuntu | Yes | No (use your user and `sudo`) | Yes |
| Arch | Yes | No | Yes |
| CachyOS | Yes | No | Yes |
| Fedora | Yes | No | Yes |
| Debian | **No**: off because the default credentials are public | No | Yes |
| Proxmox VE | Yes | **Yes** (`root@pam`, headless hypervisor) | Yes |
| PS5 Bazzite Deck | Yes | No (user `ps5`, password `ps5`: change it!) | Yes |

On Debian, turn SSH on once you have a desktop:

```bash
sudo systemctl enable --now ssh.service
```

The other images start it at boot; log in with the user you created on the first boot.

### Find your PS5's IP address {#find-your-ps5s-ip-address}

In a terminal on the PS5:

```bash
ip -brief a
```

The interface that is `UP` with an address from your home network is the one (`wlp*` for Wi-Fi, `enp*` for Ethernet).

Without a picture, look in your router's list of connected devices for a host named after the distro (`ubuntu`, `archlinux`, `ps5` and so on).

### Connect {#connect-over-ssh}

```bash
ssh <your-username>@<ps5-ip>
```

Accept the host key prompt the first time you connect.

`WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` after you switched the console to another install (bootc instead of Legacy, a reflash, another drive) is expected: every install has its own host key. Remove the old one with `ssh-keygen -R <ps5-ip>` and connect again. If you changed nothing on the console, don't connect, and ask on Discord. From here you can troubleshoot even if the display is black, see [Black screen, but SSH works](/troubleshooting/display#black-screen-but-ssh-works).

## Collect logs {#collect-logs-for-a-bug-report}

### PS5 Bazzite Deck

Run `ps5-report`, on the console or over SSH. It collects your hardware details and the relevant logs into one file, and only reads. Ask in `#bazzite-problems` on [Discord](https://discord.gg/ps5linux) and attach that file.

Without a network connection, copy the report to the USB drive's FAT32 partition and take it from there on your PC:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp ~/ps5-report-*.txt $E/
```

### Other images

One command gathers everything a helper will ask for:

```bash
{
  echo "=== uname ==="; uname -a
  echo "=== distro ==="; cat /etc/os-release
  echo "=== cmdline ==="; cat /proc/cmdline
  echo "=== lspci ==="; lspci -nn
  echo "=== dmesg ==="; dmesg
  echo "=== journal (this boot) ==="; journalctl -b --no-pager
  echo "=== amdgpu firmware ==="; ls /lib/firmware/amdgpu/
  echo "=== loaded modules ==="; lsmod
} > ps5-log-$(date +%Y%m%d-%H%M).txt 2>&1
```

Copy the file to your PC with `scp`:

```bash
scp <user>@<ps5-ip>:ps5-log-*.txt .
```

## Ask for help

Attach the log file on Discord (or upload it to a paste service and share the link), and say:

- what you did, what you expected and what happened instead,
- which image and kernel (`uname -r`) and which PS5 model and firmware,
- for display problems, the display and the cable, with the EDID if asked (see [Reporting a display problem](/troubleshooting/display#reporting-a-display-problem)):

  ```bash
  cat /sys/class/drm/card*/card*-*/edid > edid.bin
  ```

:::tip
A report without a log usually gets a request for the log first, so send it with the question.
:::
