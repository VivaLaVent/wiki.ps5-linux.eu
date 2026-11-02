---
title: Known issues and FAQ
sidebar_label: Known issues & FAQ
sidebar_position: 1
description: Current known issues with PS5 Linux and answers to frequently asked questions.
---

# Known issues and FAQ

## Known issues

| Issue | Status |
| --- | --- |
| VCN HEVC encoding has corrupt colours with P-frames (also a red screen when streaming or recording) | Workaround: [I-frame-only or H.264](/hardware/vcn#using-it-with-ffmpeg) |
| Wi-Fi (mwifiex) drops under load | Open, [workaround](/using-linux/networking/wifi#driver-stuck-under-sustained-load) |
| Screen saver broken | Open: disable it |
| No HDMI audio on some monitors | Open, see [Audio](/using-linux/audio) |
| 1440p/2160p display problems on some monitors | Open, see [Display output](/using-linux/display) |
| CachyOS doesn't boot (kernel panic) | Reported on Discord, no tracked issue; use Ubuntu, Arch or PS5 Bazzite Deck |
| MediaTek Wi-Fi/Bluetooth (most Slims, PS5 Pro) | Wi-Fi drivers in kernel 7.2.3 and later (the Slim's since 30 October 2026); the Bluetooth needs [btusb fixes](/using-linux/bluetooth), in rmuxnet's 7.3.1 kernel and PS5 Bazzite Deck |
| No picture after choosing a display mode | See [Display recovery](/troubleshooting/display-recovery) |
| Kernel update on M.2 causes a black screen | Reported on Discord, no tracked issue; workaround: stay on 7.0.10 |
| Audio plays through the controller instead of HDMI | [Workaround available](/using-linux/audio#audio-plays-through-the-controller-instead-of-hdmi) |
| Black screen after boot or after a mode change, Linux still running | [Lock the display link](/troubleshooting/display-link-lock) |
| Bluetooth missing (`hci0` absent, `Host halt failed, -110`) | Kernels built from upstream between 5 Sep and 27 Oct 2026; update to 7.2.3 or newer, see [Bluetooth troubleshooting](/using-linux/dualsense#bluetooth-troubleshooting) |
| DualSense pairs but won't reconnect | [Make the adapter connectable](/using-linux/dualsense#dualsense-pairs-once-but-wont-reconnect) |
| Sysctl or module settings not applied after boot | [Systemd ordering cycle](/troubleshooting/modules-not-loading) |
| Switching from Gaming Mode to the desktop kills HDMI | [Choose the session before booting](/using-linux/boot-to-desktop) |
| No AV1 hardware decode, no GPU load sensor | Hardware limits, see [Browser video](/using-linux/browser-video) |

### CachyOS currently broken

Several users, rmux among them, reported on Discord that the official CachyOS image panics right after the orange LED stops blinking. There is no tracked issue for it yet; if you hit it, open one on [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image/issues) with the panic text so it can be linked here. Until then, use Ubuntu, Arch or [PS5 Bazzite Deck](/installation/bazzite-deck). The [package repository](/advanced/package-repository#fix-scripts-for-older-images) has a `fix-cachyos.sh` for images that do boot.

One user reported CachyOS running on firmware 13.60 with the official image and a kernel built from ps5-linux-patches (kernel 7.2.3). This has not been confirmed by the wiki editors, so treat it as a lead and not as a fix.

An older image (7.0.2) may still work. This Gamescope session fix applied to an earlier issue on those images:

```bash
sed -i 's/-steamos3//' /usr/bin/gamescope-session-ps5
```

### Kernel update breaks M.2 boot

Users reported on Discord that updating the kernel on an M.2 install gave a black screen, and that staying on **7.0.10** avoided it. There is no tracked issue and no confirmed cause; it has not been re-tested on 7.2.3. If you hit it, report it on [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches/issues) with `dmesg` so it can be linked here. If you already updated and get a black screen, reinstall 7.0.10 with chroot, see [Recovery via chroot](./recovery.md).

## FAQ

### What are the default username and password?

It depends on the image. The official CachyOS image uses `steam` / `steam` and the hostname `ps5`. [PS5 Bazzite Deck](/installation/bazzite-deck) uses `ps5` / `ps5`. Ubuntu has no default user, see [First boot](/installation/first-boot). Change the password with `passwd` after the first login, because SSH password login is on by default on some images.

### Which USB port do I use for the Linux drive?

On the original PS5, use the front USB-C port or one of the rear USB-A ports. The front USB-A port is USB 2.0: booting from it works, but it is much slower. On the PS5 Slim, use the rear ports. See [USB ports](/hardware/usb-storage#usb-ports).

### What happens when I restart Linux?

A normal restart starts the PS5 OS, and you run the jailbreak and the loader again. To restart straight into Linux instead, use `kexec`: it works on any image, see [Restart straight into Linux](/advanced/warm-reboot). It is also the safe way to test a new kernel.

### Why is the screen black on the first boot?

A black screen on the first boot is common, and Linux is usually running. Switch TTY with <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2 to 3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. If it keeps happening, see [Lock the display link](/troubleshooting/display-link-lock).

### Why are my fan and boost off?

On upstream's kernels the CPU boost is off until you install `ps5-linux-tools` and enable `ps5boost.service` (older kernels also need `ps5fan.service`; since the 7.2.3 packages of 28 October 2026 the fan follows a curve by itself). On rmuxnet's 7.3.1 kernel the fan curve and the GPU clock are automatic and the CPU boost is a sysfs switch; on PS5 Bazzite Deck both are on. See [Fan control](/hardware/fan) and [Clocks and boost](/hardware/gpu#clocks-and-boost).

### Will newer firmware be supported?

The Slim and the Pro are already supported. For firmware, the exploit chain stops at 13.60 and the ps5-linux project states that 14.00 and later won't be supported. See [Supported firmware](/getting-started/firmware).

### Can I dual-boot Linux and the PS5 OS?

Not in the usual sense. This is a soft-mod: you run the exploit each time you want to boot Linux, and a normal power-on starts the PS5 OS.

### Can I use rest mode or resume with Linux?

Shutting down Linux puts the PS5 into rest mode, and the next power-up starts the PS5 OS. Suspend-to-idle from Linux (sleep and wake without leaving Linux) exists as `ps5-linux-patches` PR #4 by Dasloh and ships in [PS5 Bazzite Deck](/installation/bazzite-deck); it is not in the official kernel yet.

### Does Linux change the internal SSD?

No. Linux runs from USB or M.2, and the internal SSD is never touched.

### After a reboot, the PS5 says "Repairing" or "PS5 wasn't turned off properly"

This is normal and harmless.

### The screen saver started during a long install and the screen is frozen

SSH in from another device and run `sudo reboot`. Always disable the screen saver before long operations: it is currently broken and can't be dismissed.

### The loader says "Could not create PS5 WiFi firmware directory"

This is not fatal. The loader carries on and Linux still boots; this message is not the cause of boot failures.

### My PS5 goes back to the PS5 OS instead of booting Linux

You pressed the power button before the orange LED became solid. Wait for solid orange, then press. Also check that USB power in rest mode is enabled, see [Prerequisites](/getting-started/prerequisites).

### Linux won't boot after running the exploit

Make sure you didn't run etaHEN, kstuff or any other payload before sending the Linux loader. Restart the PS5, jailbreak again from scratch and send only the Linux loader, see [Booting Linux](/installation/booting#send-the-linux-loader).
