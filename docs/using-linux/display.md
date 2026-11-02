---
title: Display output
sidebar_position: 1
description: Supported resolutions, confirmed monitors and TVs, and black screen troubleshooting.
---

# Display output

HDMI 2.1 output is driven by `amdgpu` and works out of the box once the driver loads. Both Wayland and X11 work; Wayland (Sway, Weston) is recommended.

## Supported resolutions

| Resolution | Refresh rate | Status |
| --- | --- | --- |
| 1080p | 60 Hz | Working |
| 1080p | 120 Hz | Confirmed on ASUS VY249HGR (see below) |
| 1440p | 60 Hz | Working (issues on some monitors) |
| 1440p | 120 Hz | Confirmed on Dell S3225QC |
| 2160p (4K) | 60 Hz | Working (issues on some monitors) |

[PS5 Bazzite Deck](/installation/bazzite-deck#what-works-on-your-console) has offered 1440p and 4K at 120 Hz, HDR and VRR on consoles with the FLAVA3 HDMI chip since mid-2026. The same features (HDR, CEC, hotplug, native FRL for 4K at 120 Hz) were merged into `ps5-linux-patches` in October and November 2026 and reach other images with the next kernel release, see [Kernel setup](/advanced/kernel#recently-merged-and-still-pending). 30 Hz is not offered.

:::tip[`amdgpu.force_1080p=1` caps the refresh rate]
This flag ships in the default `cmdline.txt` and was long assumed to be required. Testing on 2026-07-10 showed it is not needed for every monitor, and it **caps output at 60 Hz**, even on displays that support more.

Confirmed on an ASUS VY249HGR (native 1920×1080 at 120 Hz, FreeSync 48–120 Hz according to its EDID): capped at 60 Hz with the flag, full 120 Hz without it. A Lenovo T23d-10 (a 60 Hz panel) also worked fine without the flag.

If your monitor shows nothing at all, the flag is still worth trying (see below). If it works without it, leave it out, especially on a high refresh rate panel.
:::

## Confirmed working monitors

These work without any `cmdline.txt` changes unless noted:

- MSI MAG274Q QD E2 (1440p at 60 Hz)
- Dell S2721DGF (1440p at 60 Hz)
- Dell U2515H (1440p at 60 Hz)
- LG 27GL850 (reported)
- Lenovo Legion Y27q (reported)
- ViewSonic Elite XG270QG (reported)
- ASUS VY249HGR (1080p at 120 Hz over HDMI; **remove** `amdgpu.force_1080p=1` to get 120 Hz)
- Lenovo T23d-10 (1080p at 60 Hz over HDMI)
- Gigabyte M27UP (1440p and 4K at 60 Hz both confirmed, HDMI and sound working)
- Samsung Odyssey G50D 27" (1440p at 60 Hz)
- AOC Q27G4 (remove the `video=DP-1:...` line and add `amdgpu.force_1080p=1`)
- ASUS TUF Gaming VG289Q (4K at 60 Hz, sound working)

## Confirmed working TVs

- LG C1 OLED (4K at 60 Hz)
- LG C2 (4K at 60 Hz, default `cmdline.txt`, HDCP on)
- LG C4 48" (4K at 60 Hz; audio delay is a separate known issue, see [Audio](./audio.md#hdmi-audio-delay))
- TCL 4K 55" (4K at 60 Hz, Wi-Fi and Bluetooth also working, kernel 7.1.2 or later)
- Hisense 58A7100F (4K, 1440p and 1080p at 60 Hz all confirmed)
- Hisense 6 Series 55" (4K, after a TV firmware update; before that it was stuck at 1080p)
- Xiaomi TV A 50 (2025 model)

:::info[The same model can still behave differently]
It is not unusual for the exact same monitor or TV to work for one person and show a black screen for another. Panel revision, firmware version and cable quality all seem to matter. Treat these lists as "known to work for someone", not as a guarantee.
:::

## Troubleshooting a black screen

:::tip[The console is running but shows nothing?]
If Linux is running (white LED) but you chose a mode your display can't show, see [Display recovery](/troubleshooting/display-recovery) to get a shell and change the mode by command.
:::

**Try these in order:**

1. Remove `video=DP-1:1920x1080@60` from `cmdline.txt` on the FAT32 partition.
2. Add `amdgpu.force_1080p=1` to `cmdline.txt`.
3. Toggle HDCP on and off in the PS5 settings (try both).
4. Try a different monitor or cable.
5. Try an **HDMI-to-VGA adapter**. This has got some problematic monitors working.
6. Switch to tty2 and back to tty1.

**Kernel-level fix (advanced):** some users fixed a persistent black screen by commenting out these calls in `drivers/ps5/hdmi.c` and rebuilding the kernel:

```c title="drivers/ps5/hdmi.c"
// sceSetBackToUnpluggedSequence();
// sceSetBackToWaitResolutionSequence();
// In the FLAVA3 block: comment out i2c_cmd_4_2() and the sceSetEdid/sceSetWaitPll calls
```

See [Kernel setup](/advanced/kernel) for how to rebuild.

### Link training error (the most common cause)

This is by far the most common root cause of black screens across many monitor models. Check `dmesg` for:

```text
amdgpu 0000:20:00.0: [drm] *ERROR* perform_8b_10b_clock_recovery_sequence: Link Training Error, could not get CR after 100 tries. Possibly voltage swing issue
```

It is fixed by [ps5-linux-patches commit fe852d3](https://github.com/ps5-linux/ps5-linux-patches/commit/fe852d3cdb82cd6994072bfdb29d4b7dea803f13). Update to a kernel that includes it before trying anything else on this page.

If you can't update yet, toggling the resolution can recover the link without a reboot. For example, with `kscreen-doctor` (KDE), switch to 1080p and back to your target resolution a few seconds later.

### Gamescope doesn't recover from a link training failure (SteamOS/CachyOS)

Symptoms: the LED is white (Linux is running), SSH works and Steam/Gamescope are running, but there is **no signal** on any display (the TV reports no input, rather than showing a black picture). `dmesg` shows the link training error above repeating every 60–90 seconds.

Gamescope grabs the DRM device during its initial modeset, hits the link training failure, and never probes again, even after the PS5's HDMI driver reads the EDID successfully (`hdmi: got real edid` in `dmesg`). Running `echo detect > /sys/class/drm/card0-DP-1/status` does not help, because Gamescope already holds the device.

There is no known fix on CachyOS or SteamOS-based images yet. Workaround: use an Ubuntu-based image, which handles this correctly.

### 4K display: black screen after login

If Linux boots but the screen turns black or blue after the login screen on a 4K display:

1. In the PS5 OS, go to **Settings → Screen and Video → Video Output**. Set the resolution to **2160p (4K)**, not Automatic, and **disable 120 Hz**.
2. Add your resolution to `cmdline.txt` on the FAT32 partition:

   ```text
   video=HDMI-A-1:3840x2160@60
   ```

3. If the desktop still doesn't appear, SSH in and switch to another desktop environment. GNOME works for some users where other desktops fail.

### Black screen when switching to desktop mode (SteamOS/Bazzite)

The system boots fine into Game Mode, but the screen flashes and goes black when you switch to Desktop Mode. `dmesg` may show:

```text
[drm] Failed to add display topology, DTM TA is not initialized.
```

SSH in and force the desktop session:

```bash
steamos-session-select plasma
```

This is a confirmed fix on SteamOS and Bazzite installs. If the problem persists, update to the latest image first; newer builds alone have also fixed it.

### Black screen, but SSH works

If you can SSH in but the display stays black, collect logs. At minimum, check for missing or failed `amdgpu` firmware:

```bash
dmesg | grep -iE 'psp|ucode|firmware'
ls /lib/firmware/amdgpu/
```

Then create a full log dump as described in [Getting help](/troubleshooting/getting-help#collect-logs-for-a-bug-report) and share it on Discord.

## Custom EDID injection

If your monitor's EDID is not read or parsed correctly (common on some 4K and ultrawide displays), you can load a known-good EDID dump manually:

1. Dump your monitor's EDID from another PC. On Windows, use one of the free EDID tools. On Linux, run `cat /sys/class/drm/card*/edid` while the monitor is connected.
2. Copy the `.bin` file to `/lib/firmware/edid/my_edid.bin` on the Linux partition.
3. Add this to `cmdline.txt`:

   ```text
   drm.edid_firmware=DP-1:edid/my_edid.bin
   ```

The connector name (`DP-1` here) must match your actual output. Check `/sys/class/drm/` for the exact name.

## Capture cards

Capture cards behave like any other display. See [Capture cards](/hardware/capture-cards).
