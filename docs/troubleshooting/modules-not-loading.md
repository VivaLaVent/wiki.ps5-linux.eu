---
title: Modules or sysctl settings not loading
sidebar_position: 4
description: Fix random failures after boot caused by a systemd ordering cycle that skips module loading and sysctl.
---

# Modules or sysctl settings not loading

Things fail at random after boot: a driver is missing, `/etc/sysctl.d` values are not applied, or a service behaves differently from one boot to the next.

:::note[Not for PS5 Bazzite Deck]
This concerns distros where you manage the kernel and services yourself. PS5 Bazzite Deck users: not seen on that image; report it in #bazzite-problems if you think you hit it.
:::

## Cause

`ps5-stage-firmware.service` can create a systemd ordering cycle. To break the cycle, systemd skips one of the units in it, and the ones skipped can be `systemd-sysctl` and `systemd-modules-load`. Nothing visible fails, so the symptom is only that settings are missing.

:::note[Not tested]
Reported with the official CachyOS image. Other images may not have this service. Check with the command below before you change anything.
:::

## Check for the cycle

```bash
journalctl -b | grep -i "ordering cycle"
```

No output means you don't have this problem.

## Fix

Add one line under `[Unit]` in the service file:

```bash
sudo systemctl edit --full ps5-stage-firmware.service
```

```ini
[Unit]
DefaultDependencies=no
```

Reboot, then run the check again. It should print nothing.
