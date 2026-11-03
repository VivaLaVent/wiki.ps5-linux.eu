---
title: Display output
sidebar_position: 1
description: Supported resolutions and refresh rates, what to try when a monitor stays black, and how to load a custom EDID.
---

# Display output

The HDMI port is driven by `amdgpu` through the console's HDMI chip, and a picture appears as soon as the driver loads. Wayland and X11 both work; the ready-made images use Wayland sessions. What the chip can and can't output, and why, is on [HDMI chip](/hardware/hdmi).

## Supported resolutions

| Resolution | Refresh rate | Consoles |
| --- | --- | --- |
| 1080p | 60 Hz, 120 Hz | Every console |
| 1440p | 60 Hz | Every console |
| 1440p | 120 Hz | FLAVA3 HDMI chip |
| 2160p (4K) | 60 Hz | Every console |
| 2160p (4K) | 120 Hz | FLAVA3 HDMI chip, HDMI 2.1 TVs that accept the console's FRL link |

HDR and VRR also need the FLAVA3 chip; VRR is PS5 Bazzite Deck only. Nothing else is possible: 30 Hz, 165 Hz, ultrawide and other resolutions have no setup in the HDMI chip, see [Why only certain modes exist](/hardware/hdmi#why-only-certain-modes-exist). Whether a mode is offered also depends on the display: the kernel reads its EDID and drops what the display doesn't accept.

:::tip[`amdgpu.force_1080p=1` caps the refresh rate]
Some images ship this parameter in `cmdline.txt` as a safety net. It isn't needed for most displays, and it **limits the output to 1080p60**, including on panels that could do 120 Hz. If you get a picture without it, leave it out; keep it only for a display that shows nothing otherwise, see [Troubleshooting a black screen](#troubleshooting-a-black-screen).
:::

Monitors behave less predictably than TVs. 1440p and 4K at 60 Hz work on most, but some models show nothing at those modes, get no audio, or need a parameter change. The same model can also work for one person and stay black for another: panel revision, the monitor's firmware and the cable all play a part. If your monitor needs a particular setting, the HDMI driver's log says what it saw, see [Display recovery](/troubleshooting/display-recovery#read-the-hdmi-drivers-log).

## Troubleshooting a black screen

:::tip[The console is running but shows nothing?]
If Linux is running (white LED) but you chose a mode your display can't show, see [Display recovery](/troubleshooting/display-recovery) to get a shell and change the mode by command.
:::

Work down this list; stop as soon as you have a picture:

1. Remove `video=DP-1:1920x1080@60` from `cmdline.txt` on the FAT32 partition.
2. Add `amdgpu.force_1080p=1` to `cmdline.txt`.
3. Turn HDCP off in the PS5 settings (and if it was already off, turn it on): some displays only sync one way.
4. Try another cable, another HDMI input, or another display.
5. Put an HDMI-to-VGA adapter in between. It has worked on monitors that refuse the direct connection.
6. Switch TTY: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait a few seconds, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>.

**Kernel-level fix (advanced):** a black screen that survives everything above has been cured by taking three steps out of the HDMI driver's setup sequence in `drivers/ps5/hdmi.c` and rebuilding the kernel:

```c title="drivers/ps5/hdmi.c"
// sceSetBackToUnpluggedSequence();
// sceSetBackToWaitResolutionSequence();
// In the FLAVA3 block: comment out i2c_cmd_4_2() and the sceSetEdid/sceSetWaitPll calls
```

See [Kernel setup](/advanced/kernel) for how to rebuild.

### Link training error (the most common cause)

Most black screens, across all kinds of displays, come down to one thing: the internal DisplayPort link between the GPU and the HDMI chip fails to train. `dmesg` shows:

```text
amdgpu 0000:20:00.0: [drm] *ERROR* perform_8b_10b_clock_recovery_sequence: Link Training Error, could not get CR after 100 tries. Possibly voltage swing issue
```

Current kernels carry the fix ([ps5-linux-patches commit fe852d3](https://github.com/ps5-linux/ps5-linux-patches/commit/fe852d3cdb82cd6994072bfdb29d4b7dea803f13)). Update before you try anything else on this page.

On a kernel you can't update yet, changing the resolution and changing it back retrains the link without a reboot: with `kscreen-doctor` (KDE), for example, switch to 1080p and then back a few seconds later. [Lock the display link](/troubleshooting/display-link-lock) stops it from recurring.

### Gamescope doesn't recover from a link training failure (SteamOS/CachyOS)

Symptoms: white LED, SSH works, Steam and Gamescope are running, but the display reports **no signal** (as opposed to a black picture), and `dmesg` repeats the link training error every minute or two.

Gamescope takes the DRM device during its first mode set, runs into the training failure and never probes the display again, not even after the HDMI driver has read the EDID (`hdmi: got real edid` in `dmesg`). Writing `detect` to `/sys/class/drm/card0-DP-1/status` doesn't help because Gamescope already holds the device.

There is no fix inside the Gamescope-based images for this. A desktop-based image (Ubuntu, for example) recovers by itself, and so does a kernel with the link training fix above.

### 4K display: black screen after login

If Linux boots but the screen turns black or blue after the login screen on a 4K display:

1. In the PS5 OS, go to **Settings → Screen and Video → Video Output**. Set the resolution to **2160p (4K)**, not Automatic, and **disable 120 Hz**.
2. Add your resolution to `cmdline.txt` on the FAT32 partition:

   ```text
   video=HDMI-A-1:3840x2160@60
   ```

3. If the desktop still doesn't appear, SSH in and try another desktop environment: the problem can be in the session, not in the output.

### Black screen when switching to desktop mode (SteamOS/Bazzite)

The system boots into Game Mode, but the screen flashes and goes black when you switch to Desktop Mode. `dmesg` may show:

```text
[drm] Failed to add display topology, DTM TA is not initialized.
```

SSH in and force the desktop session:

```bash
steamos-session-select plasma
```

If it keeps happening, update the image first: newer builds have fixed it on their own. To avoid the switch altogether, choose the session before you boot, see [Boot to the desktop or Gaming Mode](./boot-to-desktop.md).

### Black screen, but SSH works

If you can SSH in but the display stays black, collect logs. At minimum, check for missing or failed `amdgpu` firmware:

```bash
dmesg | grep -iE 'psp|ucode|firmware'
ls /lib/firmware/amdgpu/
```

Then create a full log dump as described in [Getting help](/troubleshooting/getting-help#collect-logs-for-a-bug-report) and share it on Discord.

## Custom EDID injection

When a display's EDID is not read or parsed correctly (it happens on some 4K and ultrawide displays), you can hand the kernel a known-good copy:

1. Dump the EDID from another PC. On Windows, use one of the free EDID tools. On Linux, run `cat /sys/class/drm/card*/edid` while the monitor is connected.
2. Copy the `.bin` file to `/lib/firmware/edid/my_edid.bin` on the Linux partition.
3. Add this to `cmdline.txt`:

   ```text
   drm.edid_firmware=DP-1:edid/my_edid.bin
   ```

The connector name (`DP-1` here) must match your output. Check `/sys/class/drm/` for the exact name.

## Capture cards

A capture card is just another display to the kernel, see [Capture cards](/hardware/capture-cards).
