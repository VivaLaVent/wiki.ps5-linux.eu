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
| VCN HEVC encoding has corrupt colours with P-frames | Workaround: [I-frame-only or H.264](/hardware/vcn#using-it-with-ffmpeg) |
| Wi-Fi (mwifiex) drops under load | Open, [workaround](/using-linux/networking/wifi#driver-stuck-under-sustained-load) |
| Screen saver broken | Open: disable it |
| No HDMI audio on some monitors | Open, see [Audio](/using-linux/audio) |
| 1440p/2160p display problems on some monitors | Open, see [Display output](/using-linux/display) |
| CachyOS doesn't boot (kernel panic) | Broken: use Ubuntu or Arch |
| Kernel update on M.2 causes a black screen | Workaround: stay on 7.0.10 |
| Audio plays through the controller instead of HDMI | [Workaround available](/using-linux/audio#audio-plays-through-the-controller-instead-of-hdmi) |

### CachyOS currently broken

CachyOS currently doesn't boot; this has been confirmed by several users, including rmux. The kernel panics right after the orange LED stops blinking. **Use Ubuntu or Arch until this is fixed.**

An older image (7.0.2) may still work. This Gamescope session fix applied to an earlier issue on those images:

```bash
sed -i 's/-steamos3//' /usr/bin/gamescope-session-ps5
```

### Kernel update breaks M.2 boot

Updating the kernel on an M.2 install can cause a black screen. Stay on kernel **7.0.10** on M.2 until this is fixed. If you already updated and get a black screen, reinstall 7.0.10 with chroot, see [Recovery via chroot](./recovery.md).

## FAQ

### Will the PS5 Slim or newer firmware be supported?

We don't know, and we don't want to jinx anything. See [Supported firmware](/getting-started/firmware).

### Can I dual-boot Linux and the PS5 OS?

Not in the usual sense. This is a soft-mod: you run the exploit each time you want to boot Linux, and a normal power-on starts the PS5 OS.

### Can I use rest mode or resume with Linux?

Not at the moment. Shutting down Linux puts the PS5 into rest mode. Relaunching Linux on the next power-up may be added later.

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
