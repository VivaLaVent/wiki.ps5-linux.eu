---
title: Display and HDMI
sidebar_position: 2
description: Output modes, 4K at 120 Hz, VRR, HDR, black screens and display recovery on the PS5 HDMI chip.
hardware: [original, slim, pro]
applies_to: all
---

# Display and HDMI

Modes, black screens, 4K120, VRR and HDR. Performance once there is a picture is on [GPU](/troubleshooting/gpu).

## Quick answers {#display-settings}

| Problem | Do this |
| --- | --- |
| Black screen, console is running | [Get the picture back](#display-recovery), then [Black screen](#black-screen) |
| Stuck at 1080p | Choose the mode yourself: desktop display settings, or Steam's in Game Mode. 1080p60 is only the safe first mode |
| No 120 Hz, 4K120 or VRR | Needs the FLAVA3 chip and a display that supports it, see [Which modes work](#supported-resolutions) |
| HDR washed out | VERDE has no HDR. On FLAVA3, see [HDR](#hdr) |
| Colours too dark or washed out without HDR | [RGB range](#rgb-range) |
| No picture until the HDMI cable is replugged | Turn off the TV's HDMI Device Link/CEC and auto input switching; report it with `ps5-report` |
| Black after choosing a mode | Desktop: wait 15 seconds, the old mode returns. Otherwise [Get the picture back](#display-recovery) |
| TV dark at every mode after trying 4K120 | Unplug the TV's power for a minute, then start the console |
| Black screen in a game on a PS5 Pro | [PS5 Pro](/troubleshooting/ps5-pro#other-problems-on-the-pro) |

## Which modes work {#supported-resolutions}

<a id="the-two-hdmi-chips"></a><a id="why-only-certain-modes-exist"></a>

The console has one of two HDMI chips. Check yours: `sudo dmesg | grep "HDMI IC Type"` (`ps5-report` shows it too).

| Mode | FLAVA3 | VERDE |
| --- | --- | --- |
| 1080p60, 1080p120, 1440p60, 4K60 | ✅ | ✅ |
| 1440p120 | ✅ | ⚠️ PS5 Bazzite Deck v2.7+, few reports |
| 4K120 | ✅ on TVs that take the link, see [4K120](#4k120-over-hdmi-21-frl) | ❌ |
| 1080p100, 1440p100, 4K100 | ⚠️ PS5 Bazzite Deck v2.7+ | ⚠️ not 4K100 |
| 144/165 Hz, ultrawide, other modes the display lists (up to 600 MHz) | ⚠️ PS5 Bazzite Deck v2.7+ | ❌ |
| VRR, HDR | ✅ | ❌ |

A mode is only offered if the display accepts it. Monitors are less predictable than TVs: the same model can work for one person and stay black for another (panel revision, firmware, cable).

`amdgpu.force_1080p=1` in `cmdline.txt` limits the output to 1080p60. Keep it only for a display that shows nothing without it.

## Black screen {#black-screen}

First update: current kernels fix the most common cause, a failed link to the HDMI chip (`Link Training Error, could not get CR` in `dmesg`). <a id="link-training-error-the-most-common-cause"></a>

Then work down this list and stop when you have a picture:

1. Remove `video=DP-1:1920x1080@60` from `cmdline.txt`.
2. Add `amdgpu.force_1080p=1` to `cmdline.txt`.
3. Toggle HDCP in the PS5 settings (off if it was on, on if it was off).
4. Another cable, HDMI input or display.
5. An HDMI-to-VGA adapter in between: it has worked on monitors that refuse the direct connection.
6. [Switch TTY](#tty-switch).
7. HDMI Device Link off in the PS5 settings, see [Required PS5 settings](/installation/booting#required-ps5-settings).
8. Ask on [Discord](https://discord.gg/ps5linux) with a [report](#reporting-a-display-problem).

Specific cases:

- **4K display, black or blue after login** <a id="4k-display-black-screen-after-login"></a>: in the PS5 OS set **Settings → Screen and Video → Video Output** to **2160p**, not Automatic, with 120 Hz off; add `video=HDMI-A-1:3840x2160@60` to `cmdline.txt`.
- **Black when switching to Desktop Mode** <a id="switch-to-desktop"></a> (`DTM TA is not initialized` in `dmesg`): over SSH, `steamos-session-select plasma`. Update the image; on PS5 Bazzite Deck from v2.6.1, a start with the loader goes to Desktop Mode without a switch.
- **No signal on a Gamescope image, link training error repeating:** Gamescope doesn't probe the display again. Update the kernel, or use a desktop image.
- **Black, but SSH works** <a id="black-screen-but-ssh-works"></a>: check the GPU firmware with `dmesg | grep -iE 'psp|ucode|firmware'` and `ls /lib/firmware/amdgpu/`, then [collect logs](/troubleshooting/getting-help#collect-logs-for-a-bug-report).

## Get the picture back {#display-recovery}

The console runs but the TV shows nothing. Get in with a keyboard (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F3</kbd> for a text login) or over [SSH](/post-install/ssh).

### 1. Switch TTY {#tty-switch}

<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 3 seconds, <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH: `sudo chvt 2; sleep 3; sudo chvt 1`. A USB keyboard may need replugging afterwards.

### 2. Change the mode {#change-the-mode-from-a-desktop}

KDE, over SSH:

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u) DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus
```

```bash
kscreen-doctor -o                                   # outputs and their modes (the HDMI output is DP-1)
kscreen-doctor output.DP-1.mode.3840x2160@60        # resolution@refresh rate
kscreen-doctor output.DP-1.hdr.disable              # HDR off (enable = on)
kscreen-doctor output.DP-1.vrrpolicy.never          # VRR off (automatic = only full-screen apps, always)
```

PS5 Bazzite Deck in Game Mode: the resolution has no command, use step 3. VRR off: `export XDG_RUNTIME_DIR=/run/user/$(id -u) GAMESCOPE_WAYLAND_DISPLAY=gamescope-0; gamescopectl adaptive_sync 0`. To the desktop: `steamos-session-select plasma`.

### 3. Safe mode for one start

1080p60 only, which every display accepts. Set the mode you want from the desktop, then remove it again:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo sed -i 's/[[:space:]]*$/ amdgpu.force_1080p=1/' $E/cmdline.txt && sudo systemctl poweroff
```

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo sed -i 's/ *amdgpu\.force_1080p=1//' $E/cmdline.txt && sudo systemctl poweroff
```

After a failed 4K120 attempt, add ` hdmi.frl_4k120=0` instead: it only takes that mode away.

## 4K at 120 Hz {#4k120-over-hdmi-21-frl}

FLAVA3 only, over HDMI 2.1 (FRL). Offered when the display announces FRL at 4 lanes × 8 Gbps or more and YCbCr 4:2:2. If the link doesn't come up within 6.5 seconds, the console falls back to the same size at the highest rate still offered.

- Check: `sudo dmesg | grep -e 4K120 -e 'over FRL'` (`4K120 possible`, `3840x2160@120 over FRL`).
- TV dark at every mode after a failed attempt: unplug the TV's power for a minute.
- Never offer it: `hdmi.frl_4k120=0` in `cmdline.txt`.
- GPU fault when switching between Game Mode and the desktop at 4K120: keep the desktop at 4K60.

## VRR {#vrr-on-flava3}

FLAVA3 only, PS5 Bazzite Deck. Confirmed at 4K60, 1080p120, 1440p60 and 1440p120. Steam's VRR setting switches it.

- No "Enable VRR" option: a VERDE console, a display without a VRR range, or VRR off for that input on the TV. `sudo dmesg | grep "PS5 VRR"` says which.
- The range never goes below 48 Hz (OLEDs flicker below it): under 48 fps, frames are doubled in 100 and 120 Hz modes, and 60 Hz modes stay at 60.
- FreeSync-only monitors: from v2.7.1.

## HDR {#hdr}

FLAVA3 only. On VERDE no PS5 Linux kernel can set HDR up, so PS5 Bazzite Deck from v2.10 doesn't offer it there.

On FLAVA3, HDR goes out as 12-bit 4:2:2 only at **1080p60 or 4K60**. Washed out: check which the kernel used, with HDR on:

```bash
echo 'file drivers/ps5/hdmi.c +p' | sudo tee /sys/kernel/debug/dynamic_debug/control
sudo dmesg | grep 'hdmi: setup:' | tail -3
```

`12 bpc YCbCr 4:2:2` is the HDR path. `8 bpc RGB` means another mode is set, or Game Mode didn't ask for BT.2020.

## RGB range {#rgb-range}

Dark or washed-out colours without HDR: set the TV's HDMI black level to match. PS5 Bazzite Deck sends full range by default.

`hdmi.rgb_range=` in `cmdline.txt`: `1` full (default), `2` limited, `0` lets the TV decide. Leave the desktop's own RGB range setting on Automatic.

## TVs that drop to HDMI 1.4 modes

4K60 RGB, 120 Hz and VRR disappear a few seconds after the start. PS5 Bazzite Deck writes the SCDC data such TVs expect; on other images, update the kernel.

## Custom EDID {#custom-edid-injection}

For a display whose EDID isn't read correctly:

1. Dump the EDID on another PC (Linux: `cat /sys/class/drm/card*/edid` with the monitor connected).
2. Copy it to `/lib/firmware/edid/my_edid.bin` on the Linux partition.
3. Add `drm.edid_firmware=DP-1:edid/my_edid.bin` to `cmdline.txt`.

Capture cards are displays too, see [Capture cards](/troubleshooting/peripherals#capture-cards).

## Display link lock (older kernels) {#display-link-lock}

Only for a kernel without the link training fix: black after the start or after a mode change, with `Link Training Error` in `dmesg`. PS5 Bazzite Deck locks the link itself.

Without a restart:

```bash
echo "4 0x1e" | sudo tee /sys/kernel/debug/dri/0/DP-1/link_settings
echo 1 | sudo tee /sys/kernel/debug/dri/0/DP-1/trigger_hotplug
```

If it stays black, wait for `hdmi: got real edid` in `dmesg` and run the second line again. On KDE try the [TTY switch](#tty-switch) first: a hotplug can make KWin lose the screen.

At every start:

```bash title="/usr/local/bin/dp-link-lock"
#!/bin/sh
f=/sys/kernel/debug/dri/0/DP-1/link_settings
mountpoint -q /sys/kernel/debug || mount -t debugfs none /sys/kernel/debug
for i in $(seq 60); do [ -e "$f" ] && break; sleep 0.5; done
echo "4 0x1e" > "$f"
```

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

```bash
sudo chmod +x /usr/local/bin/dp-link-lock && sudo systemctl enable dp-link-lock
```

After a restart, `cat /sys/kernel/debug/dri/0/DP-1/link_settings` shows `Preferred: 4 0x1e`.

## Report a display problem {#reporting-a-display-problem}

1. Make it happen: choose the mode or setting that fails, wait 15 seconds, then run this line. It only reads, and saves `display-log-<time>.txt` in your home folder and on the boot partition:

```bash
F=~/display-log-$(date +%H%M).txt; { echo "== version"; cat /etc/ps5-bazzite-deck-version 2>/dev/null; cat /etc/os-release | head -2; uname -v; cat /proc/cmdline; echo "== EDID (base64)"; sudo cat /sys/class/drm/card0-DP-1/edid | base64 -w0; echo; echo "== modes offered"; cat /sys/class/drm/card0-DP-1/modes | sort | uniq -c; echo "== current mode and VRR"; sudo grep -E "crtc\[|enable=|active=|mode:|vrr_enabled" /sys/kernel/debug/dri/0/state 2>/dev/null | head -20; echo "== HDMI chip"; sudo dmesg | grep -i -e "hdmi" -e "VRR" -e "FRL" -e "re-arm" | tail -60; echo "== compositor"; journalctl --user -b --no-pager -o cat 2>/dev/null | grep -i -e "drm:" -e "modeset" -e "vrr" -e "adaptive" -e "edid" | tail -40; } > $F 2>&1; E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp $F $E/ 2>/dev/null; echo "saved $F"
```

2. Post the file on [Discord](https://discord.gg/ps5linux) with: the TV or monitor model, HDMI port and cable; what you chose and what you saw; the display's VRR, enhanced-format and game-mode settings; and the last release it worked on.

Reading the driver's log yourself: `sudo dmesg | grep -i -e hdmi -e VRR -e FRL -e re-arm | tail -60`

| Line | Meaning |
| --- | --- |
| `HDMI IC Type` | FLAVA3 or VERDE |
| `hdmi: got real edid` | The display's EDID arrived; before it, the kernel only knows a fallback |
| `PS5 VRR: available …` / `not available (…)` | Why VRR is or isn't offered |
| `4K120` lines | Whether the display qualifies and whether the link came up |
| `Link Training Error, could not get CR` | The link to the HDMI chip failed, see [Black screen](#black-screen) |

The EDID, for a paste: `sudo cat /sys/class/drm/card0-DP-1/edid | base64 -w0; echo`. Decoded: `sudo edid-decode /sys/class/drm/card0-DP-1/edid`.

## Kernel parameters

All display parameters are on [Boot options](/post-install/boot-options#options). PS5 Bazzite Deck v2.10 adds four test switches (`hdmi.rearm`, `hdmi.edid_keep`, `hdmi.scdc_writes`, `hdmi.sleep_mute`, all on), see its [testing notes](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/main/docs/testing.md#display-switches).
