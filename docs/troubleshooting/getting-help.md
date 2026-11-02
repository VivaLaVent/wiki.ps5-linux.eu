---
title: SSH and getting help
sidebar_position: 5
description: Connect to your PS5 over SSH, collect logs and write a bug report that gets answers.
---

# SSH and getting help

If something is broken and you want help on [Discord](https://discord.gg/ps5linux), SSH access and a proper log dump will get you a real answer much faster. This page covers both.

## SSH availability by distro

| Distro | SSH on by default | Root login | Password login |
| --- | --- | --- | --- |
| Ubuntu 26.04 | Yes | No (use your user and `sudo`) | Yes |
| Arch | Yes | No | Yes |
| CachyOS | Yes | No | Yes |
| Fedora | Yes | No | Yes |
| Debian 12 | **No**: disabled by default because the default credentials are public | No | Yes |
| Proxmox VE | Yes | **Yes** (`root@pam`, headless hypervisor) | Yes |
| PS5 Bazzite Deck | Yes | No (user `ps5`, password `ps5`: change it!) | Yes |

On Debian, enable SSH yourself once you reach the desktop:

```bash
sudo systemctl enable --now ssh.service
```

On every other distro it is already running: log in with the user account you created on first boot.

## Find your PS5's IP address

On the PS5, open a terminal and run:

```bash
ip -brief a
```

Look for an interface that is `UP` and has an address in your local network range (`wlp*` for Wi-Fi, `enp*` for Ethernet).

No display? Check your router's list of DHCP clients for a device named after your distro (for example `ubuntu` or `archlinux`).

## Connect over SSH

```bash
ssh <your-username>@<ps5-ip>
```

Accept the host key prompt the first time you connect. From here you can troubleshoot even if the display is black, see [Black screen, but SSH works](/using-linux/display#black-screen-but-ssh-works).

## Collect logs for a bug report

:::tip[PS5 Bazzite Deck]
Run `ps5-report` instead: it collects your hardware details and the relevant logs into one file. Ask in `#bazzite-problems` on the [Bazzite Deck Discord](https://discord.gg/qGcuTgBBYU). For display problems, see [Reporting a display problem](./display-recovery.md#reporting-a-display-problem).
:::

Before posting on Discord, collect everything relevant in one go:

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

Post the file on Discord (or upload it to a paste service and share the link), together with:

- what you expected to happen and what actually happened,
- your distro, kernel version (`uname -r`) and PS5 firmware version,
- for display problems, your monitor and cable. Include the EDID if asked:

  ```bash
  cat /sys/class/drm/card*/card*-*/edid > edid.bin
  ```

:::tip
Vague reports without logs are the number one reason people don't get help quickly.
:::
