---
title: Lock the display link
sidebar_position: 3
description: Stop black screens caused by DisplayPort link training failures by locking the link to four lanes at HBR3 before the display starts.
---

# Lock the display link

If the screen goes black after boot, or when the resolution changes, but Linux is still running (white LED, SSH works), the cause is often the link between the GPU and the HDMI converter. This page explains the cause and shows how to lock the link so it stays stable.

:::note[Not tested]
This fix was reported on the official CachyOS image with an upstream kernel. It writes to `debugfs`, which is not a stable interface, so the path may change between kernels. Share your results on [Discord](https://discord.gg/ps5linux).
:::

## Why it happens

The GPU does not output HDMI directly. It sends DisplayPort (DP) to an internal DP to HDMI converter. When you pick a mode below 4K, the driver can lower the link speed. The converter then fails to sync and the screen goes black. `dmesg` shows the same error as in [Link training error](/using-linux/display#link-training-error-the-most-common-cause):

```text
[drm] *ERROR* perform_8b_10b_clock_recovery_sequence: Link Training Error, could not get CR after 100 tries
```

A kernel that includes the fix described there needs none of this. Use this page when you can't update the kernel yet, or when the black screen comes back.

## Recover without a reboot

Try these in order. All of them need Linux to be running.

1. Switch the TV or monitor input away and back.
2. Switch TTY. Press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2 to 3 seconds, then press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Repeat if needed.
3. Lock the link and force a hotplug. Run both lines on the PS5 (from tty2 or over SSH):

   ```bash
   echo "4 0x1e" | sudo tee /sys/kernel/debug/dri/0/DP-1/link_settings
   echo 1 | sudo tee /sys/kernel/debug/dri/0/DP-1/trigger_hotplug
   ```

4. If the screen is still black, wait for `hdmi: got real edid` in `dmesg`, then run the hotplug line a second time.

`4 0x1e` means four lanes at HBR3, the highest link rate. On a KDE desktop a hotplug can make KWin lose the screen, so try the TTY switch first. Gamescope is not affected.

:::tip[A USB keyboard may drop out]
Switching TTYs can disconnect a USB keyboard or mouse. Unplug it and plug it in again.
:::

## Lock the link at every boot

A service that runs before the display manager starts keeps the link locked.

Create the script:

```bash title="/usr/local/bin/dp-link-lock"
#!/bin/sh
f=/sys/kernel/debug/dri/0/DP-1/link_settings
mountpoint -q /sys/kernel/debug || mount -t debugfs none /sys/kernel/debug
for i in $(seq 60); do [ -e "$f" ] && break; sleep 0.5; done
echo "4 0x1e" > "$f"
```

Create the service:

```ini title="/etc/systemd/system/dp-link-lock.service"
[Unit]
Description=Lock DP-1 link to 4x HBR3 (PS5 HDMI converter)
After=systemd-modules-load.service sys-kernel-debug.mount
Before=display-manager.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/dp-link-lock

[Install]
WantedBy=multi-user.target
```

Make the script executable and enable the service:

```bash
sudo chmod +x /usr/local/bin/dp-link-lock
sudo systemctl enable dp-link-lock
```

Reboot, then check the link:

```bash
cat /sys/kernel/debug/dri/0/DP-1/link_settings
```

The output shows `Preferred: 4 0x1e` when the lock is active. A few `CR` errors and one warning trace in `dmesg` during boot are normal.

## Use a safe mode as well

Keep `video=DP-1:1920x1080@60` in `cmdline.txt` so the first mode set at boot is one every display accepts. Change the resolution from the desktop once Linux is running. See [Kernel setup](/advanced/kernel#kernel-parameters-cmdlinetxt).
