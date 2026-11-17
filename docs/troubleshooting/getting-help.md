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

<a id="ssh-availability-by-distro"></a><a id="find-your-ps5s-ip-address"></a><a id="connect-over-ssh"></a>

When the screen stays black, Linux is often still running: connect from a PC or phone on the same network, as on [Connect over SSH](/post-install/ssh) (Windows, macOS, Linux and phones, the user per image, and the usual errors).

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
