---
title: Known issues and FAQ
sidebar_label: Known issues & FAQ
sidebar_position: 1
description: Current known issues with PS5 Linux and answers to frequently asked questions.
hardware: [original, slim, pro]
applies_to: all
---

# Known issues and FAQ

What is known to be broken or limited, with the workaround where there is one, and the questions that come up most often.

## Known issues

| Issue | Status |
| --- | --- |
| VCN HEVC encoding has corrupt colours with P-frames (also a red screen when streaming or recording) | Workaround: [I-frame-only or H.264](/hardware/gpu#using-it-with-ffmpeg) |
| Wi-Fi (IW620, `mwifiex`) drops under load | Open, [workaround](/hardware/wifi-bluetooth#driver-stuck-under-sustained-load) |
| Screen saver broken | Open: disable it |
| No HDMI audio on some monitors | Open, see [Audio](/using-linux/audio) |
| 1440p or 4K picture problems on some monitors | Open, see [Display output](/hardware/hdmi#display-settings) |
| CachyOS image doesn't boot (kernel panic) | No tracked issue; use Ubuntu, Arch or PS5 Bazzite Deck, see below |
| MediaTek Wi-Fi (most Slims, PS5 Pro) | Works with the in-kernel drivers in every current kernel, the official one included |
| MediaTek Bluetooth (most Slims, PS5 Pro) | Needs [btusb fixes](/hardware/wifi-bluetooth#bluetooth): PS5 Bazzite Deck has them; rmuxnet's kernel carries a different patch that its author reports as broken; not upstream |
| PS5 Bazzite Deck v2.5 (bootc): every update fails, `Failed to start ostree-finalize-staged.service` | Fixed in later images; on v2.5, [run the fix once](/post-install/bazzite#updating) |
| PS5 Bazzite Deck v2.5 (bootc): Steam's OS Update Channel switches to Bazzite's own images, which can't start on a PS5 | Don't use it on v2.5; from v2.5.1 it lists Stable and Beta of PS5 Bazzite Deck |
| PS5 Bazzite Deck v2.5 and v2.5.1: fan louder and hunting at idle (`ps5-perf status` shows `kernel curve`) | The 7.3.1 kernel started on its own fan curve; v2.6 returns to the console's firmware control with an 80 °C target. Until then, a quieter curve from [PS5 Hardware Control](/hardware/fan#hwcon) helps |
| PS5 Pro, PS5 Bazzite Deck v2.1.6 to v2.5.1: D3D12 games go black (`ring gfx_0.0.0 timeout`, `GPU Recovery Failed: -110`) | Fixed in v2.6, see [Command-processor microcode](/hardware/ps5-pro#cp-microcode) |
| Emergency shell at start, `/dev/disk/by-label/bazzite-deck does not exist` or `Not all disks have been found` | The system partition wasn't found: flash again with balenaEtcher, see [Flash the image](/installation/flash#check-the-download) |
| Legacy update stops with `this is not a PS5 Bazzite Deck install` | Installs whose root isn't `LABEL=bazzite-deck` (copied to an M.2, for example); fixed in the v2.6 update: run the update command with `v2.6` |
| No picture after choosing a display mode | See [Display recovery](/hardware/hdmi#display-recovery) |
| Kernel update on an M.2 install leaves a black screen or no network | See [below](#kernel-update-breaks-m2-boot) |
| Starting Linux ends on the PS5 login screen (rest mode error) | See [below](#rest-mode-error-back-to-the-ps5-login-screen) |
| Audio plays through the controller instead of HDMI | [Workaround](/using-linux/audio#audio-plays-through-the-controller-instead-of-hdmi) |
| Black screen after boot or after a mode change, Linux still running | [Lock the display link](/hardware/hdmi#display-link-lock) |
| Bluetooth missing (`hci0` absent, `Host halt failed, -110`) | Kernels built from upstream during the weeks when the Salina xHCI start was disabled; update, see [Bluetooth troubleshooting](/using-linux/dualsense#bluetooth-troubleshooting) |
| Bluetooth settings find no new devices on an original PS5 (`Busy`, `Command Disallowed`) | Some PS5 Bazzite Deck releases; fixed in the current one, see [Bluetooth](/hardware/wifi-bluetooth#iw620-marvell) |
| A controller is refused in a loop (`Refusing connection … unknown device`) | [Pair it on the Linux profile](/hardware/wifi-bluetooth#controller-refused-in-a-loop) |
| Slim: a controller connects and drops after a few seconds | Open. Test with `ps5-bt-address off` and report the result |
| DualSense pairs but won't reconnect | [Make the adapter connectable](/using-linux/dualsense#dualsense-pairs-once-but-wont-reconnect) |
| Fan target back at 50 °C after sleep | Some PS5 Bazzite Deck releases; fixed in the current one |
| Sysctl or module settings not applied after boot | [Systemd ordering cycle](/troubleshooting/modules-not-loading) |
| Switching from Gaming Mode to the desktop kills HDMI | [Choose the session before booting](/using-linux/boot-to-desktop) |
| GPU fault when switching sessions at 4K120 (some TVs) | A compositor-side bug. Keep the desktop at 4K60, see [Known limits](/post-install/all-distros#known-limits) |
| PS5 Pro: a GPU fault isn't recovered (`GPU Recovery Failed`), black screen until a restart | Open: a full GPU reset fails on this hardware even with the base firmware (the DMA engines don't come back). Restart over SSH with the sysrq sequence on [PS5 Pro](/hardware/ps5-pro#starting-linux-fails-on-the-pro) rather than holding the power button, which can damage the filesystem |
| `Failed to pin framebuffer: -ENOMEM` under memory pressure | Open. More zram or swap helped in one report, see [Memory and swap](/post-install/all-distros#memory-and-swap) |
| VRR refused on a TV that announces no VRR maximum | Old PS5 Bazzite Deck releases; fixed, see [HDMI chip](/hardware/hdmi#vrr-on-flava3) |
| 165 Hz, ultrawide and other refresh rates | Not possible: the HDMI chip has no setup for them, see [HDMI chip](/hardware/hdmi#why-only-certain-modes-exist) |
| No AV1 hardware decode, no GPU load sensor on the base PS5 | Hardware limits, see [Browser video](/using-linux/browser-video) |

### CachyOS image doesn't boot

The official CachyOS image can panic right after the orange LED stops blinking. Nobody has filed an issue with the panic text yet; if it happens to you, open one on [ps5-linux-image](https://github.com/ps5-linux/ps5-linux-image/issues) so it can be linked here. Until then, use Ubuntu, Arch or [PS5 Bazzite Deck](/choose/bazzite-deck). The [package repository](/advanced/package-repository#fix-scripts-for-older-images) has a `fix-cachyos.sh` for images that do boot.

Individual reports of CachyOS running with a current upstream kernel exist, but the wiki editors haven't confirmed one. Treat them as a lead, not as a fix.

Older CachyOS images needed this Gamescope session fix for a different problem:

```bash
sed -i 's/-steamos3//' /usr/bin/gamescope-session-ps5
```

### Kernel update breaks M.2 boot

Two different problems get reported under this name.

**Official and community images:** some users who updated the kernel on an M.2 install got a black screen afterwards and had to go back to the kernel the image shipped with. There is no tracked issue and no confirmed cause, and it hasn't been re-tested with the current upstream packages. If you hit it, report it on [ps5-linux-patches](https://github.com/ps5-linux/ps5-linux-patches/issues) with `dmesg`. To go back, reinstall the previous kernel package through a chroot, see [Recovery via chroot](/troubleshooting/recovery).

**PS5 Bazzite Deck:** the kernel and initrd always have to come from the USB drive's `boot` partition, which is where the update script puts them. A loader that takes `bzImage` and `initrd.img` from somewhere else (a second drive, a copy on the M.2) starts the **old kernel with the new modules**: the network is gone and the log is full of `disagrees about version of symbol`. Boot with only the USB drive's boot partition in reach of the loader, see [Install to the internal M.2](/installation/m2-install#ps5-bazzite-deck).

### Rest mode error, back to the PS5 login screen

The loader works by putting the console into rest mode; when the LED turns solid orange, the power button starts Linux. If the LED goes from white straight to steady orange without blinking, or the PS5 shows a rest mode error, and the power button then starts the PS5 OS, rest mode was refused or interrupted. It happens on every model, the Pro included, and the image on the drive has nothing to do with it. The usual causes:

- **USB devices that block rest mode.** Hubs, keyboards and mice on the fast ports can keep the console from entering rest mode.
- **Leftover state from a failed attempt.** After one failed start, the next one often fails too until the system is restarted fully.

Fix: plug the boot drive directly into a fast port, with nothing else on the fast ports, and connect the hub, keyboard and mouse only once Linux is up (the slow USB 2.0 port is fine for a keyboard). After a failed attempt, restart the PS5 OS completely (not into rest mode) before you jailbreak again. Also check that USB power in rest mode is set to **Always**, see [Prerequisites](/getting-started/prerequisites).

## FAQ

### What are the default username and password?

It depends on the image. The official CachyOS image logs in as `steam` with the password `steam` and the hostname `ps5`. [PS5 Bazzite Deck](/choose/bazzite-deck) uses `ps5` for both. Ubuntu asks you to create a user on the first boot, see [First boot](/installation/first-boot). Change the password with `passwd` right after the first login: SSH with password login is on by default on most images.

### Which USB port do I use for the Linux drive?

Any fast port. On the original PS5 that is the front USB-C port or one of the rear USB-A ports; the front USB-A port is USB 2.0 and boots, but slowly. On the PS5 Slim, use the rear ports. See [USB ports](/hardware/storage#usb-ports).

### What happens when I restart Linux?

A normal restart starts the PS5 OS, and you run the jailbreak and the loader again. To go straight back into Linux instead, use `kexec`: it works on any image, see [Restart straight into Linux](/advanced/warm-reboot). It is also the safe way to test a new kernel.

### Why is the screen black on the first boot?

A black screen on the first boot is common, and Linux is usually running behind it. Switch TTY with <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2 to 3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. If it keeps happening, see [Lock the display link](/hardware/hdmi#display-link-lock).

### Why are my fan and boost off?

On the upstream kernel the CPU boost is off until you install `ps5-linux-tools` and enable `ps5boost.service`; older upstream kernels also needed `ps5fan.service`, current ones run a fan curve by themselves. On rmuxnet's kernel the fan curve and the GPU clock are automatic and the CPU boost is a sysfs switch; on PS5 Bazzite Deck both are on. See [Fan control](/hardware/fan) and [Clocks and boost](/hardware/gpu#clocks-and-boost).

### Will newer firmware be supported?

The Slim and the Pro are already supported. For the system software, the exploit chain ends at the newest supported version and the ps5-linux project has stated that later versions won't be supported. See [Supported firmware](/getting-started/prerequisites#firmware).

### Can I dual-boot Linux and the PS5 OS?

Not in the usual sense. Nothing is installed on the console: you run the exploit each time you want Linux, and a normal power-on starts the PS5 OS.

### Can I use rest mode or sleep with Linux?

Shutting Linux down puts the PS5 into rest mode, and the next power-up starts the PS5 OS; Linux can't resume from the console's rest mode. What does exist: suspend-to-idle (sleep and wake without leaving Linux), an open pull request on rmuxnet's repository that [PS5 Bazzite Deck](/choose/bazzite-deck) ships, and the warm restart (`kexec`) that skips the PS5 OS and the loader, see [Restart straight into Linux](/advanced/warm-reboot). Both are experimental.

### Does Linux change the internal SSD?

No. Linux runs from USB or M.2, and the internal SSD is never written to.

### After a reboot, the PS5 says "Repairing" or "PS5 wasn't turned off properly"

Expected after a Linux session, and harmless.

### The screen saver started during a long install and the screen is frozen

SSH in from another device and run `sudo reboot`. Turn the screen saver off before any long operation: it is broken on the PS5 and can't be dismissed.

### The loader says "Could not create PS5 WiFi firmware directory"

Harmless. The loader carries on and Linux boots; look elsewhere if the boot fails.

### My PS5 goes back to the PS5 OS instead of booting Linux

Either the power button was pressed before the orange LED stopped blinking, USB power in rest mode isn't set to **Always** (see [Prerequisites](/getting-started/prerequisites)), or rest mode itself failed, see [Rest mode error](#rest-mode-error-back-to-the-ps5-login-screen).

### Linux won't boot after running the exploit

Send the Linux loader as the only payload. If etaHEN, kstuff or anything else ran first, restart the PS5, jailbreak again and send only the loader, see [Booting Linux](/installation/booting#send-the-linux-loader).

## Next steps

- [Hardware status](/hardware/matrix): what works on each model
- [After installing](/post-install/all-distros)
- [Troubleshooting & help](/troubleshooting/getting-help)
