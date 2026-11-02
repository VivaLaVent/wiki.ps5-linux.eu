---
title: Display recovery
sidebar_position: 2
description: No picture? Get a shell, change the display mode by command, and collect display logs.
---

# Display recovery

When the console is running but the TV shows nothing (a wrong mode, or a mode the TV doesn't accept), you can still reach it and change the mode.

The commands below that mention Game Mode, `gamescopectl` or the `ps5` user are for [PS5 Bazzite Deck](/installation/bazzite-deck) (default user and password: `ps5` / `ps5`). The rest works on any image.

## 1. Get a shell

**With a keyboard on the PS5 (TTY):** press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F3</kbd> for a text login. To get back to the picture, press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd> or <kbd>F2</kbd>. If the TV shows nothing at all, the text console won't show either; use SSH instead.

**Over the network (SSH):** from a PC on the same network (Windows: PowerShell; macOS/Linux: a terminal):

```bash
ssh <user>@<console-ip>
```

The console's IP address is in your router's list of devices (on Bazzite it is often named `bazzite`). See [SSH and getting help](./getting-help.md) for more.

**Quick fix to try first:** switching TTYs back and forth can bring the picture back. With a keyboard: <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F2</kbd>, wait 2–3 seconds, then <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>F1</kbd>. Over SSH:

```bash
sudo chvt 2; sleep 3; sudo chvt 1
```

## 2. Game Mode (PS5 Bazzite Deck)

**Turn VRR off or on:**

```bash
export XDG_RUNTIME_DIR=/run/user/$(id -u) GAMESCOPE_WAYLAND_DISPLAY=gamescope-0
gamescopectl adaptive_sync 0      # off (1 = on)
```

The picture comes back within a few seconds.

**Resolution:** Game Mode takes its resolution from Steam's settings, which have no command. If it remembered a mode the TV can't show, take that mode away for one boot so Game Mode falls back to one that works:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo sed -i 's/[[:space:]]*$/ amdgpu.force_1080p=1/' $E/cmdline.txt && sudo systemctl poweroff
```

Start with the loader: Game Mode comes up at 1080p60. Set the mode you want under **Settings → Display**, then remove the option again and power off:

```bash
E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done)
sudo sed -i 's/ *amdgpu\.force_1080p=1//' $E/cmdline.txt && sudo systemctl poweroff
```

For **4K120** only: add ` hdmi.frl_4k120=0` instead of ` amdgpu.force_1080p=1`; that takes away only that mode.

**Switch to the desktop instead:** `steamos-session-select plasma` (and back with `steamos-session-select gamescope`).

## 3. KDE desktop

KDE's `kscreen-doctor` changes the mode directly. Over SSH, run this first:

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

## 4. The TV itself

After a failed 4K120 attempt, some TVs stay dark at every mode. Unplug the TV's power for a minute (standby isn't enough), then start the console again.

## Reporting a display problem

For a black screen, a picture that blinks or reconnects, VRR that doesn't work, or a missing mode, send this information. It shows which modes your display offers (its EDID), what the console offered and chose, and what the HDMI chip did.

1. **Get in** as described above.
2. **Make it happen:** choose the mode or turn on the setting that fails (VRR, HDR, 4K120…), wait about 15 seconds, then run this single line on a Bazzite Deck console:

   ```bash
   F=~/display-log-$(date +%H%M).txt; { echo "== version"; cat /etc/ps5-bazzite-deck-version; uname -v; cat /proc/cmdline; echo "== EDID (base64)"; sudo cat /sys/class/drm/card0-DP-1/edid | base64 -w0; echo; echo "== modes offered"; cat /sys/class/drm/card0-DP-1/modes | sort | uniq -c; echo "== current mode and VRR"; sudo grep -E "crtc\[|enable=|active=|mode:|vrr_enabled" /sys/kernel/debug/dri/0/state 2>/dev/null | head -20; echo "== HDMI chip"; sudo dmesg | grep -i -e "hdmi" -e "VRR" -e "FRL" -e "re-arm" | tail -60; echo "== Game Mode"; journalctl --user -b --no-pager -o cat 2>/dev/null | grep -i -e "drm:" -e "modeset" -e "vrr" -e "adaptive" -e "edid" | tail -40; } > $F 2>&1; E=$(for d in /boot/efi /efi; do sudo test -f $d/cmdline.txt && echo $d && break; done); sudo cp $F $E/ 2>/dev/null; echo "saved $F"
   ```

   It only reads. It saves `display-log-<time>.txt` in your home folder, plus a copy on the drive's small FAT32 partition, so without a network you can take it from there on a PC. On other images, use the general [log dump](./getting-help.md#collect-logs-for-a-bug-report).

3. **Get the picture back** (see the sections above).
4. **Post it** on Discord with the file attached, and include:
   - the **exact TV or monitor model**, and which HDMI port and cable you use,
   - **what you chose** (resolution, refresh rate, VRR on/off, HDR on/off) and **what you saw** (black, blinking, reconnecting, wrong colours),
   - the display's own settings: VRR/FreeSync/Adaptive-Sync, HDMI enhanced format/Deep Colour, game mode,
   - whether it worked on an earlier version, and which one.
