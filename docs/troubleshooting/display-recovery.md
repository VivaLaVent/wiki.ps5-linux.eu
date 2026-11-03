---
title: Display recovery
sidebar_position: 2
description: No picture? Get a shell, force a safe mode, change the display mode by command, read the HDMI driver's log and decode your EDID.
---

# Display recovery

When the console is running but the TV shows nothing (a wrong mode, or a mode the TV doesn't accept), you can still reach it and change the mode. This page works on any image; the parts that only apply to [PS5 Bazzite Deck](/installation/bazzite-deck) are marked.

## 1. Get a shell

**With a keyboard on the PS5 (TTY):** press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F3</kbd> for a text login. To get back to the picture, press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd> or <kbd>F2</kbd>. If the TV shows nothing at all, the text console won't show either; use SSH instead.

**Over the network (SSH):** from a PC on the same network (Windows: PowerShell; macOS/Linux: a terminal):

```bash
ssh <user>@<console-ip>
```

The console's IP address is in your router's list of devices. See [SSH and getting help](./getting-help.md) for the default users per image.

**Quick fix to try first:** switching TTYs back and forth can bring the picture back. With a keyboard: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2 to 3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH:

```bash
sudo chvt 2; sleep 3; sudo chvt 1
```

If the picture keeps dropping out, see [Lock the display link](./display-link-lock.md).

## 2. Force a safe mode for one boot

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

For a failed **4K120** attempt only, add ` hdmi.frl_4k120=0` instead: that takes away only that mode, see [HDMI chip](/hardware/hdmi#4k120-over-hdmi-21-frl).

## 3. Change the mode from a desktop

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

## 4. The TV itself

After a failed 4K120 attempt, some TVs stay dark at every mode. Unplug the TV's power for a minute (standby isn't enough), then start the console again.

## Read the HDMI driver's log

The PS5 HDMI driver logs what the chip reported and what it set up. The lines that matter:

```bash
sudo dmesg | grep -i -e "hdmi" -e "VRR" -e "FRL" -e "re-arm" | tail -60
```

| Line | Meaning |
| --- | --- |
| `HDMI IC Type` | FLAVA3 or VERDE, see [HDMI chip](/hardware/hdmi#the-two-hdmi-chips). |
| `hdmi: got real edid` | The chip passed on the display's EDID. Until this appears, the kernel only knows a fallback. |
| `PS5 VRR: available, range ...` or `not available (...)` | Why VRR is or isn't offered. |
| `4K120` lines | Whether the EDID gate passed and whether the FRL link came up. |
| `Link Training Error, could not get CR` | The internal DP link to the chip failed, see [Lock the display link](./display-link-lock.md). |

## Decode the EDID

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

Look for the HDMI Forum block (`Max_FRL_Rate`, `VRRmin`/`VRRmax`, `SCDC_Present`) and the maximum TMDS clock: they decide which modes and features the kernel offers, see [HDMI chip](/hardware/hdmi).

## Reporting a display problem

For a black screen, a picture that blinks or reconnects, VRR that doesn't work, or a missing mode, send this information. It shows which modes your display offers (its EDID), what the console offered and chose, and what the HDMI chip did.

1. **Get in** as described above.
2. **Make it happen:** choose the mode or turn on the setting that fails (VRR, HDR, 4K120), wait about 15 seconds, then run this single line:

   ```bash
   F=~/display-log-$(date +%H%M).txt; { echo "== version"; cat /etc/ps5-bazzite-deck-version 2>/dev/null; cat /etc/os-release | head -2; uname -v; cat /proc/cmdline; echo "== EDID (base64)"; sudo cat /sys/class/drm/card0-DP-1/edid | base64 -w0; echo; echo "== modes offered"; cat /sys/class/drm/card0-DP-1/modes | sort | uniq -c; echo "== current mode and VRR"; sudo grep -E "crtc\[|enable=|active=|mode:|vrr_enabled" /sys/kernel/debug/dri/0/state 2>/dev/null | head -20; echo "== HDMI chip"; sudo dmesg | grep -i -e "hdmi" -e "VRR" -e "FRL" -e "re-arm" | tail -60; echo "== compositor"; journalctl --user -b --no-pager -o cat 2>/dev/null | grep -i -e "drm:" -e "modeset" -e "vrr" -e "adaptive" -e "edid" | tail -40; } > $F 2>&1; E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp $F $E/ 2>/dev/null; echo "saved $F"
   ```

   It only reads. It saves `display-log-<time>.txt` in your home folder, plus a copy on the drive's small FAT32 partition, so without a network you can take it from there on a PC.

3. **Get the picture back** (see the sections above).
4. **Post it** on [Discord](https://discord.gg/ps5linux) (PS5 Bazzite Deck: `#bazzite-problems` on [its Discord](https://discord.gg/qGcuTgBBYU)) with the file attached, and include:
   - the **TV or monitor model**, and which HDMI port and cable you use,
   - **what you chose** (resolution, refresh rate, VRR on/off, HDR on/off) and **what you saw** (black, blinking, reconnecting, wrong colours),
   - the display's own settings: VRR/FreeSync/Adaptive-Sync, HDMI enhanced format/Deep Colour, game mode,
   - whether it worked on an earlier release, and which one.
