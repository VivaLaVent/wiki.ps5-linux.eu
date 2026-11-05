---
title: SSH and getting help
sidebar_position: 5
description: Connect to your PS5 over SSH, collect logs and write a bug report that gets answers.
hardware: [original, slim, pro]
applies_to: all
---

# SSH and getting help

A question on [Discord](https://discord.gg/ps5linux) gets answered quickly when it comes with a log, and a log is easiest to collect over SSH. This page sets up both.

## SSH availability by distro

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

## Find your PS5's IP address

In a terminal on the PS5:

```bash
ip -brief a
```

The interface that is `UP` with an address from your home network is the one (`wlp*` for Wi-Fi, `enp*` for Ethernet).

Without a picture, look in your router's list of connected devices for a host named after the distro (`ubuntu`, `archlinux`, `ps5` and so on).

## Connect over SSH

```bash
ssh <your-username>@<ps5-ip>
```

Accept the host key prompt the first time you connect.

`WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!` after you switched the console to another install (bootc instead of Legacy, a reflash, another drive) is expected: every install has its own host key. Remove the old one with `ssh-keygen -R <ps5-ip>` and connect again. If you changed nothing on the console, don't connect, and ask on Discord. From here you can troubleshoot even if the display is black, see [Black screen, but SSH works](/hardware/hdmi#black-screen-but-ssh-works).

## Collect logs for a bug report

:::tip[PS5 Bazzite Deck]
Run `ps5-report` instead: it collects your hardware details and the relevant logs into one file. Ask in `#bazzite-problems` on the [Bazzite Deck Discord](https://discord.gg/ps5linux). For display problems, see [Reporting a display problem](/hardware/hdmi#reporting-a-display-problem).
:::

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

Attach the file on Discord (or upload it to a paste service and share the link), and say:

- what you did, what you expected and what happened instead,
- which image and kernel (`uname -r`) and which PS5 model and firmware,
- for display problems, the display and the cable, with the EDID if asked:

  ```bash
  cat /sys/class/drm/card*/card*-*/edid > edid.bin
  ```

:::tip
A report without a log usually gets a request for the log first, so send it with the question.
:::

## Next steps

- [Hardware status](/hardware/matrix): what works on each model
- [After installing](/post-install/all-distros)
- [Troubleshooting & help](/troubleshooting/getting-help)
