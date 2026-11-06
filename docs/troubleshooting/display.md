---
title: Display and HDMI
sidebar_position: 2
description: Output modes, 4K at 120 Hz, VRR, HDR, black screens and display recovery on the PS5 HDMI chip.
hardware: [original, slim, pro]
applies_to: all
---

# Display and HDMI

Everything about the picture: which modes the console's HDMI chip can drive, how to set them, and what to do when the screen stays black. Performance once there is a picture is on [GPU](/troubleshooting/gpu).

The GPU does not drive the HDMI port directly. It sends DisplayPort to a separate HDMI chip, and the kernel programs that chip over I2C through the console's ICC for every mode. This page explains what the chip can do and what the PS5 patches do with it. The user-facing side (resolutions, black screens) is on [Display output](#display-settings).

:::info[Where the patches live]
HDR, CEC, hotplug, 4K120 over FRL with its fallback and ALLM are in upstream `ps5-linux-patches` and in rmuxnet's kernel. The VRR, mode, RGB range and link lock patches are PS5 Bazzite Deck only, in its [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches) folder; each file starts with a description of what it does. See [Kernel setup](/post-install/kernel#what-is-where).
:::

## The two HDMI chips

| Chip | Consoles | Extras |
| --- | --- | --- |
| FLAVA3 | Most consoles | 1440p at 120 Hz, 4K at 120 Hz over FRL, HDR, VRR |
| VERDE | Some later models | 1080p60, 1080p120, 1440p60 and 4K60 only |

Check which one you have:

```bash
sudo dmesg | grep "HDMI IC Type"
```

## Why only certain modes exist

The chip has no general-purpose mode set. For each resolution it has a fixed setup: a mode index written to registers `0x7227` and `0x7070`, a PHY configuration and a block of InfoFrame registers. The kernel replays Sony's setup for the mode the compositor asked for. A mode the chip has no setup for cannot be output, whatever the GPU or the display can do. That rules out 165 Hz, ultrawide resolutions and every other mode not in the table below.

The GPU feeds the chip over an internal DisplayPort link of four lanes at HBR3. That link is wide enough for every mode below, but the driver used to train it at the lowest rate a mode needs, and the chip sometimes failed to sync at those lower rates. `ps5-hdmi-link-lock.patch` trains it at the full rate for every mode; the same idea by hand is on [Lock the display link](#display-link-lock).

| Mode | Timing the chip expects | FLAVA3 | VERDE | Status |
| --- | --- | --- | --- | --- |
| 1080p60 | CEA VIC 16 | ✅ | ✅ | Confirmed |
| 1080p120 | CEA VIC 63 | ✅ | ✅ | Confirmed |
| 1440p60 | VESA DMT reduced blanking | ✅ | ✅ | Confirmed |
| 1440p120 | CVT-RB, same high-bandwidth setup as 4K60 | ✅ | ❌ | Confirmed |
| 4K60 | CEA VIC 97 | ✅ | ✅ | Confirmed |
| 4K120 | CEA VIC 118 over FRL, Sony's index `0x0b` | ✅ | ❌ | Confirmed on some TVs, fails on others (see below) |
| 1080p100, 1440p100, 4K100 | VIC 64, CVT-RB, VIC 117 (index `0x0a`) | ⚠️ | ❌ | Not tested: offered as an experiment only |
| 165 Hz, ultrawide, anything else | | ❌ | ❌ | Known not to work: no setup in the chip |

`ps5-hdmi-modes.patch` offers these modes whenever the display's limits allow them, even if its EDID doesn't list them, drops the display's own 1440p variants (the chip only accepts the timing above), marks 1080p60 as preferred so a new display starts there, and skips modes a display accepts only as YCbCr 4:2:0. It also gives both 1440p syncs the standard polarity and shape on FLAVA3, because the chip shifts the picture by the pulse width when a polarity differs. `ps5-hdmi-100hz-test.patch` adds the 100 Hz modes.

## VRR on FLAVA3

Confirmed at 4K60, 1080p120, 1440p60 and 1440p120 on HDMI VRR TVs. Not available on VERDE.

VRR did not work because of the GPU side, not the chip. Captures of what the PS5 OS sends narrowed it down. Three things have to be true at once:

1. **A timing packet every frame.** Sony's GPU sends the chip a DisplayPort extension SDP with header `39 04` carrying the source timing, from the adaptive-sync slot. On the chip it replaces amdgpu's FreeSync SDP. Without it the chip's follow mode gives a black picture.
2. **DPCD `0x107` MSA-ignore bit kept clear.** The chip drops its input lock when the bit is set, but follows a variable frame length with valid MSA.
3. **Follow mode switched on step by step**, only after the packet flows: registers `0x6064`, `0x1047`, `0x600c`, `0x6224` and `0x6c07`, 250 ms apart, plus a FreeSync SPD in the chip's SPD slot `0x7240` for the TV. The picture stays muted until the chip has switched over, so you see a short black instead of a drifting picture.

Three more rules come from testing:

- **HDMI VRR only.** The chip's follow mode is HDMI VRR. A monitor that announces only AMD FreeSync (no VRR range in its HDMI Forum block) resynced and blanked at every refresh change, so such displays are not offered VRR, the same as on the PS5 OS. The log says why.
- **48 Hz floor.** TVs often announce 40 Hz as their minimum, where OLEDs flicker visibly. The range used never goes below 48 Hz, the PS5 OS's own floor: below it, frames are doubled at 120 Hz modes, and 60 Hz modes keep a fixed 60 Hz. A TV with a higher minimum keeps it.
- **An open-ended maximum counts as HDMI VRR.** Some TVs announce HDMI VRR with a minimum and `VRRmax` 0, which the HDMI specification defines as "up to the highest refresh rate". Early versions of the patch read that as "no HDMI VRR" and refused it; the current one takes the maximum from the FreeSync range, or 120 Hz. The range is also read from the HF-SCDB block that newer TVs use instead of the VSDB. The log says why a display is or isn't offered VRR.

Sources: `ps5-vrr.patch`, `ps5-vrr-stock-setup.patch` (the chip only follows when every setup includes Sony's full PHY tail and VSync block), `ps5-vrr-min-48.patch`, `ps5-vrr-hdmi-only.patch`, `ps5-vrr-follow-guard.patch` and `ps5-vrr-hdmi-range.patch` in the [`patches/`](https://github.com/VivaLaVent/ps5-bazzite-deck/tree/main/patches) folder.

:::tip[PS5 Bazzite Deck]
Steam's VRR setting switches it. From a shell: `gamescopectl adaptive_sync 0` (or `1`) after exporting `XDG_RUNTIME_DIR` and `GAMESCOPE_WAYLAND_DISPLAY=gamescope-0`, see [Display recovery](#display-recovery).
:::

## 4K120 over HDMI 2.1 FRL

Confirmed on several HDMI 2.1 TVs; fails on others that announce 4K120 but don't take the console's FRL link. FLAVA3 only.

The setup is Sony's own for its 4K120 mode (mode id 211 in the PS5 OS), ported from the console's kernel:

- VIC 118 gets Sony's mode index `0x0b` and its own basic-config tail.
- After the PHY setup, the chip gets the "SCEI"/"PS5" SPD and an event sequence (`0x30`) that it runs by itself once the FRL link is up: AVI with the VIC, IT content, game content type.
- The additional config is the FRL variant: no TMDS scrambling or SCDC; the output is started in FRL mode and the chip trains the link itself.
- On the internal DP link, 4K120 travels as YCbCr 4:2:2, amdgpu's own fallback when RGB doesn't fit in four lanes at HBR3.

Because a TV that can't take the link was left black at every boot, there is a gate and a fallback:

- **EDID gate.** 4K120 is offered only when the display announces FRL at 4 lanes × 8 Gbps or more (HF-VSDB or HF-SCDB `Max_FRL_Rate` ≥ 4) and YCbCr 4:2:2, and the chip's own FRL report (bits 3:1 of byte 0 of its EDID notification) isn't 1 to 3.
- **Link check.** After a 4K120 setup, bit 6 of register `0x7019` (set while the chip sends FRL; `0x43` on a trained link) is polled for up to 6.5 seconds. If it never comes on, 4K120 is withheld for that display until a new EDID arrives, amdgpu switches to the same size at the highest refresh rate still offered, and userspace is told to re-probe.

**A stuck TV:** after a failed 4K120 attempt some TVs stay dark at every mode. Unplug the TV's power for a minute (standby isn't enough), then start the console again. `hdmi.frl_4k120=0` in `cmdline.txt` stops 4K120 from being offered at all.

**Session switches at 4K120:** on some TVs, switching between Gaming Mode and the desktop while the output is 4K120 triggers a GPU fault. It is a compositor-side problem; keep the desktop at 4K60 and use 4K120 in Gaming Mode only. On a PS5 Pro a GPU fault is not recovered, see [PS5 Pro](/troubleshooting/ps5-pro#starting-linux-fails-on-the-pro).

Sources: `ps5-hdmi-frl-4k120.patch` and `ps5-hdmi-4k120-guard.patch`.

## SCDC and TVs that drop to HDMI 1.4 modes

Some TVs announce their HDMI 2.1 EDID at boot and then, a few seconds after the console sets up 1080p60, re-announce an HDMI 1.4 EDID: 340 MHz, 4K only as 4:2:0, nothing above 60 Hz, no VRR. The cause is SCDC traffic the TV expects from an HDMI 2.x source. Two patches write it at every video setup for sinks that talk SCDC (an HDMI Forum VSDB with `SCDC_Present`, or 4K / 4:2:0 modes in the EDID); 1080p-only HDMI 1.4 TVs never get SCDC traffic.

| Patch | Writes | Status |
| --- | --- | --- |
| `ps5-hdmi-scdc-source-version.patch` | SCDC Source Version = 1, through the chip's DDC write descriptor at `0x7a80` | Confirmed on a TV with the symptom |
| `ps5-hdmi-scdc-tmds-config.patch` | SCDC `TMDS_Config` at every setup, `0x00` when not scrambling, as a PC driver does | Not tested |

## RGB range

The GPU sends full-range RGB on the internal link, but the AVI InfoFrame's quantization field (PB3 bits Q1:Q0, chip register `0x7226` bits 3:2) stayed "default". TVs read "default" as limited for TV timings (1080p, 4K60) and as full for PC timings (1440p), so 1080p had crushed blacks while 1440p looked right. The driver now sends "full" explicitly for RGB output.

CTA-861 codes the field as 0 default, 1 limited, 2 full. A first version wrote the parameter value itself, so "1 = full" went out as limited and every resolution was too dark on TVs set to Auto. `ps5-hdmi-rgb-range-encoding.patch` maps the parameter to the right codes.

`hdmi.rgb_range=1` is full (default), `2` limited, `0` sends no flag and lets the TV decide. VERDE consoles already declare full range and don't need this.

## Kernel parameters

The display and HDMI parameters, with which kernel has which, are on **[Boot options](/post-install/boot-options#bazzite-deck)**.

## Display settings {#display-settings}

The HDMI port is driven by `amdgpu` through the console's HDMI chip, and a picture appears as soon as the driver loads. Wayland and X11 both work; the ready-made images use Wayland sessions. What the chip can and can't output, and why, is on [Display and HDMI](/troubleshooting/display).

### Supported resolutions

| Resolution | Refresh rate | Consoles |
| --- | --- | --- |
| 1080p | 60 Hz, 120 Hz | Every console |
| 1440p | 60 Hz | Every console |
| 1440p | 120 Hz | FLAVA3 HDMI chip |
| 2160p (4K) | 60 Hz | Every console |
| 2160p (4K) | 120 Hz | FLAVA3 HDMI chip, HDMI 2.1 TVs that accept the console's FRL link |

HDR and VRR also need the FLAVA3 chip; VRR is PS5 Bazzite Deck only. Nothing else is possible: 30 Hz, 165 Hz, ultrawide and other resolutions have no setup in the HDMI chip, see [Why only certain modes exist](#why-only-certain-modes-exist). Whether a mode is offered also depends on the display: the kernel reads its EDID and drops what the display doesn't accept.

:::tip[`amdgpu.force_1080p=1` caps the refresh rate]
Some images ship this parameter in `cmdline.txt` as a safety net. It isn't needed for most displays, and it **limits the output to 1080p60**, including on panels that could do 120 Hz. If you get a picture without it, leave it out; keep it only for a display that shows nothing otherwise, see [Troubleshooting a black screen](#black-screen).
:::

Monitors behave less predictably than TVs. 1440p and 4K at 60 Hz work on most, but some models show nothing at those modes, get no audio, or need a parameter change. The same model can also work for one person and stay black for another: panel revision, the monitor's firmware and the cable all play a part. If your monitor needs a particular setting, the HDMI driver's log says what it saw, see [Display recovery](#read-the-hdmi-drivers-log).

### Troubleshooting a black screen {#black-screen}

:::tip[The console is running but shows nothing?]
If Linux is running (white LED) but you chose a mode your display can't show, see [Display recovery](#display-recovery) to get a shell and change the mode by command.
:::

Work down this list; stop as soon as you have a picture:

1. Remove `video=DP-1:1920x1080@60` from `cmdline.txt` on the FAT32 partition.
2. Add `amdgpu.force_1080p=1` to `cmdline.txt`.
3. Turn HDCP off in the PS5 settings (and if it was already off, turn it on): some displays only sync one way.
4. Try another cable, another HDMI input, or another display.
5. Put an HDMI-to-VGA adapter in between. It has worked on monitors that refuse the direct connection.
6. Switch TTY: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait a few seconds, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH: `sudo chvt 2; sleep 3; sudo chvt 1`.
7. Check that HDMI Device Link is off in the PS5 settings, see [Required PS5 settings](/installation/booting#required-ps5-settings).
8. Ask on [Discord](https://discord.gg/ps5linux) and include your EDID, see [Decode the EDID](#decode-the-edid).

**Kernel-level fix (advanced):** a black screen that survives everything above has been cured by taking three steps out of the HDMI driver's setup sequence in `drivers/ps5/hdmi.c` and rebuilding the kernel:

```c title="drivers/ps5/hdmi.c"
// sceSetBackToUnpluggedSequence();
// sceSetBackToWaitResolutionSequence();
// In the FLAVA3 block: comment out i2c_cmd_4_2() and the sceSetEdid/sceSetWaitPll calls
```

See [Kernel setup](/post-install/kernel) for how to rebuild.

#### Link training error (the most common cause)

Most black screens, across all kinds of displays, come down to one thing: the internal DisplayPort link between the GPU and the HDMI chip fails to train. `dmesg` shows:

```text
amdgpu 0000:20:00.0: [drm] *ERROR* perform_8b_10b_clock_recovery_sequence: Link Training Error, could not get CR after 100 tries. Possibly voltage swing issue
```

Current kernels carry the fix ([ps5-linux-patches commit fe852d3](https://github.com/ps5-linux/ps5-linux-patches/commit/fe852d3cdb82cd6994072bfdb29d4b7dea803f13)). Update before you try anything else on this page.

On a kernel you can't update yet, changing the resolution and changing it back retrains the link without a reboot: with `kscreen-doctor` (KDE), for example, switch to 1080p and then back a few seconds later. [Lock the display link](#display-link-lock) stops it from recurring.

#### Gamescope doesn't recover from a link training failure (SteamOS/CachyOS)

Symptoms: white LED, SSH works, Steam and Gamescope are running, but the display reports **no signal** (as opposed to a black picture), and `dmesg` repeats the link training error every minute or two.

Gamescope takes the DRM device during its first mode set, runs into the training failure and never probes the display again, not even after the HDMI driver has read the EDID (`hdmi: got real edid` in `dmesg`). Writing `detect` to `/sys/class/drm/card0-DP-1/status` doesn't help because Gamescope already holds the device.

There is no fix inside the Gamescope-based images for this. A desktop-based image (Ubuntu, for example) recovers by itself, and so does a kernel with the link training fix above.

#### 4K display: black screen after login

If Linux boots but the screen turns black or blue after the login screen on a 4K display:

1. In the PS5 OS, go to **Settings → Screen and Video → Video Output**. Set the resolution to **2160p (4K)**, not Automatic, and **disable 120 Hz**.
2. Add your resolution to `cmdline.txt` on the FAT32 partition:

   ```text
   video=HDMI-A-1:3840x2160@60
   ```

3. If the desktop still doesn't appear, SSH in and try another desktop environment: the problem can be in the session, not in the output.

#### Black screen when switching to desktop mode (SteamOS/Bazzite) {#switch-to-desktop}

The system boots into Game Mode, but the screen flashes and goes black when you switch to Desktop Mode. `dmesg` may show:

```text
[drm] Failed to add display topology, DTM TA is not initialized.
```

SSH in and force the desktop session:

```bash
steamos-session-select plasma
```

If it keeps happening, update the image first: newer builds have fixed it on their own. To avoid the switch altogether, start in the session you want. On PS5 Bazzite Deck, power off and start with the loader: from v2.6.1 it starts in Desktop Mode, without a switch (to change the default, see [Game Mode and Desktop Mode](/post-install/bazzite#game-mode-and-desktop-mode)). On other SteamOS-style images, see [Boot to the desktop or Gaming Mode](/post-install/boot-to-desktop).

#### Black screen, but SSH works

If you can SSH in but the display stays black, collect logs. At minimum, check for missing or failed `amdgpu` firmware:

```bash
dmesg | grep -iE 'psp|ucode|firmware'
ls /lib/firmware/amdgpu/
```

Then create a full log dump as described in [Troubleshooting](/troubleshooting/getting-help#collect-logs-for-a-bug-report) and share it on Discord.

### Custom EDID injection

When a display's EDID is not read or parsed correctly (it happens on some 4K and ultrawide displays), you can hand the kernel a known-good copy:

1. Dump the EDID from another PC. On Windows, use one of the free EDID tools. On Linux, run `cat /sys/class/drm/card*/edid` while the monitor is connected.
2. Copy the `.bin` file to `/lib/firmware/edid/my_edid.bin` on the Linux partition.
3. Add this to `cmdline.txt`:

   ```text
   drm.edid_firmware=DP-1:edid/my_edid.bin
   ```

The connector name (`DP-1` here) must match your output. Check `/sys/class/drm/` for the exact name.

### Capture cards

A capture card is just another display to the kernel, see [Capture cards](/troubleshooting/peripherals#capture-cards).

## Picture and mode problems

- **The desktop, Steam or a browser stay at 1080p:** the HDMI driver marks 1080p at 60 Hz as the preferred mode, so the first start always has a picture, and the desktop keeps it until you choose another. Set the resolution and refresh rate in the desktop's display settings (on KDE, **System Settings → Display & Monitor**); Game Mode has its own in Steam's **Settings → Display**.
- **Colours look washed out or too dark:** set the TV's HDMI black level to match the console, see [RGB range](#rgb-range).
- **No 120 Hz, 4K120 or VRR:** these need the FLAVA3 HDMI chip and a display that supports them. HDMI 2.1 (FRL) is only used for 4K at 120 Hz (and 100 Hz); every other mode fits HDMI 2.0. On PS5 Bazzite Deck, `sudo dmesg | grep -e 4K120 -e 'over FRL'` shows whether your TV allows it (`4K120 possible`) and whether it is in use (`3840x2160@120 over FRL`).
- **100 Hz:** PS5 Bazzite Deck v2.6.1 offers 1080p, 1440p and 4K at 100 Hz on FLAVA3 consoles with `hdmi.modes_100hz=1` in `cmdline.txt`.
- **VRR on PS5 Bazzite Deck:** no "Enable VRR" option means a VERDE console, a display without HDMI VRR (FreeSync-only monitors), VRR turned off for that input on the TV, or an old release with a TV that announces no VRR maximum (update). If the screen goes dark for 2 seconds in menus, use VRR per game instead (quick access menu → Performance). OLED flicker on the desktop: set Adaptive Sync to **Automatic**, not Always.
- **No picture after choosing a display mode:** see [Black screen and display recovery](#display-recovery).
- **The screen goes black in a game on a PS5 Pro, and SSH still works:** see [PS5 Pro](/troubleshooting/ps5-pro#other-problems-on-the-pro).

## Black screen and display recovery {#display-recovery}

When the console is running but the TV shows nothing (a wrong mode, or a mode the TV doesn't accept), you can still reach it and change the mode. This page works on any image; the parts that only apply to [PS5 Bazzite Deck](/choose/bazzite-deck) are marked.

### 1. Get a shell

**With a keyboard on the PS5 (TTY):** press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F3</kbd> for a text login. To get back to the picture, press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd> or <kbd>F2</kbd>. If the TV shows nothing at all, the text console won't show either; use SSH instead.

**Over the network (SSH):** from a PC on the same network (Windows: PowerShell; macOS/Linux: a terminal):

```bash
ssh <user>@<console-ip>
```

The console's IP address is in your router's list of devices. See [Get in over SSH](/troubleshooting/getting-help) for the default users per image.

**Quick fix to try first:** switching TTYs back and forth can bring the picture back. With a keyboard: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2 to 3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH:

```bash
sudo chvt 2; sleep 3; sudo chvt 1
```

If the picture keeps dropping out, see [Lock the display link](#display-link-lock).

### 2. Force a safe mode for one boot

`amdgpu.force_1080p=1` in `cmdline.txt` only allows 1080p60, which every display accepts. Add it, power off, start with the loader, set the mode you want from the desktop, then remove it again. The commands find `cmdline.txt` on the boot partition (`/boot/efi` on most images, `/efi` on Bazzite):

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo sed -i 's/[[:space:]]*$/ amdgpu.force_1080p=1/' $E/cmdline.txt && sudo systemctl poweroff
```

Remove it again once a working mode is set:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo sed -i 's/ *amdgpu\.force_1080p=1//' $E/cmdline.txt && sudo systemctl poweroff
```

For a failed **4K120** attempt only, add ` hdmi.frl_4k120=0` instead: that takes away only that mode, see [HDMI chip](#4k120-over-hdmi-21-frl).

### 3. Change the mode from a desktop

**KDE:** `kscreen-doctor` changes the mode directly. Over SSH, run this first:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u) DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus
```

Then:

```bash
kscreen-doctor -o                                   # outputs and their modes (the HDMI output is DP-1)
kscreen-doctor output.DP-1.mode.3840x2160@60        # resolution@refresh rate
kscreen-doctor output.DP-1.hdr.disable              # HDR off (enable = on)
kscreen-doctor output.DP-1.vrrpolicy.never          # VRR off (automatic = only full-screen apps, always)
```

Unlike System Settings, `kscreen-doctor` applies the change straight away, without a "keep this mode?" question. Check the TV after each change; to undo, run it again with the previous mode.

**GNOME and others:** there is no equivalent command that works over SSH on every desktop. Use the safe mode above and change the resolution in the display settings once you have a picture.

:::tip[PS5 Bazzite Deck: Game Mode]
Game Mode takes its resolution from Steam's settings, which have no command; use the safe mode above. VRR can be switched from a shell:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u) GAMESCOPE_WAYLAND_DISPLAY=gamescope-0
gamescopectl adaptive_sync 0      # off (1 = on)
```

To switch to the desktop instead: `steamos-session-select plasma` (and back with `steamos-session-select gamescope`).
:::

### 4. The TV itself

After a failed 4K120 attempt, some TVs stay dark at every mode. Unplug the TV's power for a minute (standby isn't enough), then start the console again.

### Read the HDMI driver's log

The PS5 HDMI driver logs what the chip reported and what it set up. The lines that matter:

```bash
sudo dmesg | grep -i -e "hdmi" -e "VRR" -e "FRL" -e "re-arm" | tail -60
```

| Line | Meaning |
| --- | --- |
| `HDMI IC Type` | FLAVA3 or VERDE, see [HDMI chip](#the-two-hdmi-chips). |
| `hdmi: got real edid` | The chip passed on the display's EDID. Until this appears, the kernel only knows a fallback. |
| `PS5 VRR: available, range ...` or `not available (...)` | Why VRR is or isn't offered. |
| `4K120` lines | Whether the EDID gate passed and whether the FRL link came up. |
| `Link Training Error, could not get CR` | The internal DP link to the chip failed, see [Lock the display link](#display-link-lock). |

### Decode the EDID

The EDID is what the display tells the console it can do. Dump it as base64 so it survives a paste into Discord:

```bash
sudo cat /sys/class/drm/card0-DP-1/edid | base64 -w0; echo
```

The HDMI chip's connector is `DP-1`. List the modes the kernel built from it:

```bash
cat /sys/class/drm/card0-DP-1/modes | sort | uniq -c
```

To read the EDID yourself, install `edid-decode` (package `edid-decode` on most distros) and run it on the binary:

```bash
sudo edid-decode /sys/class/drm/card0-DP-1/edid
```

Look for the HDMI Forum block (`Max_FRL_Rate`, `VRRmin`/`VRRmax`, `SCDC_Present`) and the maximum TMDS clock: they decide which modes and features the kernel offers, see [Display and HDMI](/troubleshooting/display).

### Reporting a display problem

For a black screen, a picture that blinks or reconnects, VRR that doesn't work, or a missing mode, send this information. It shows which modes your display offers (its EDID), what the console offered and chose, and what the HDMI chip did.

1. **Get in** as described above.
2. **Make it happen:** choose the mode or turn on the setting that fails (VRR, HDR, 4K120), wait about 15 seconds, then run this single line:

   ```bash
   F=~/display-log-$(date +%H%M).txt; { echo "== version"; cat /etc/ps5-bazzite-deck-version 2>/dev/null; cat /etc/os-release | head -2; uname -v; cat /proc/cmdline; echo "== EDID (base64)"; sudo cat /sys/class/drm/card0-DP-1/edid | base64 -w0; echo; echo "== modes offered"; cat /sys/class/drm/card0-DP-1/modes | sort | uniq -c; echo "== current mode and VRR"; sudo grep -E "crtc\[|enable=|active=|mode:|vrr_enabled" /sys/kernel/debug/dri/0/state 2>/dev/null | head -20; echo "== HDMI chip"; sudo dmesg | grep -i -e "hdmi" -e "VRR" -e "FRL" -e "re-arm" | tail -60; echo "== compositor"; journalctl --user -b --no-pager -o cat 2>/dev/null | grep -i -e "drm:" -e "modeset" -e "vrr" -e "adaptive" -e "edid" | tail -40; } > $F 2>&1; E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp $F $E/ 2>/dev/null; echo "saved $F"
   ```

   It only reads. It saves `display-log-<time>.txt` in your home folder, plus a copy on the drive's small FAT32 partition, so without a network you can take it from there on a PC.

3. **Get the picture back** (see the sections above).
4. **Post it** on [Discord](https://discord.gg/ps5linux) (PS5 Bazzite Deck: `#bazzite-problems` on [its Discord](https://discord.gg/ps5linux)) with the file attached, and include:
   - the **TV or monitor model**, and which HDMI port and cable you use,
   - **what you chose** (resolution, refresh rate, VRR on/off, HDR on/off) and **what you saw** (black, blinking, reconnecting, wrong colours),
   - the display's own settings: VRR/FreeSync/Adaptive-Sync, HDMI enhanced format/Deep Colour, game mode,
   - whether it worked on an earlier release, and which one.

## Display link lock {#display-link-lock}

If the screen goes black after boot, or when the resolution changes, but Linux is still running (white LED, SSH works), the cause is often the link between the GPU and the HDMI converter. This page explains the cause and shows how to lock the link so it stays stable.

:::note[Not tested]
This fix was reported on the official CachyOS image with an upstream kernel. It writes to `debugfs`, which is not a stable interface, so the path may change between kernels. Share your results on [Discord](https://discord.gg/ps5linux).
:::

### Why it happens

The GPU does not output HDMI directly. It sends DisplayPort (DP) to an internal DP to HDMI converter. When you pick a mode below 4K, the driver can lower the link speed. The converter then fails to sync and the screen goes black. `dmesg` shows the same error as in [Link training error](#link-training-error-the-most-common-cause):

```text
[drm] *ERROR* perform_8b_10b_clock_recovery_sequence: Link Training Error, could not get CR after 100 tries
```

A kernel that includes the fix described there needs none of this. Use this page when you can't update the kernel yet, or when the black screen comes back.

### Recover without a reboot

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

### Lock the link at every boot

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

### Use a safe mode as well

Keep `video=DP-1:1920x1080@60` in `cmdline.txt` so the first mode set at boot is one every display accepts. Change the resolution from the desktop once Linux is running. See [Kernel setup](/post-install/boot-options).
