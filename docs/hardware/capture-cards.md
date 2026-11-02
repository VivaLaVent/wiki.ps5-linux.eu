---
title: Capture cards
sidebar_position: 9
description: Capture card compatibility and fixes for PS5 Linux.
---

# Capture cards

Linux sees a capture card as just another display, so the same black screen and EDID quirks apply as with regular monitors. Work through [Display output](/using-linux/display#troubleshooting-a-black-screen) first.

## AVerMedia Live Gamer Ultra (GC553)

| Resolution | Status |
| --- | --- |
| 1920×1080 at 60 Hz | ✅ Working |
| 1920×1080 at 120 Hz | ❌ Black screen |
| 2560×1440 at 60 Hz | ✅ Working (with the fix below) |
| 2560×1440 at 120 Hz | ❌ Black screen |
| 3840×2160 at 60 Hz | ❌ Black screen |

**Getting 1440p at 60 Hz working** (fixes a black screen with the default settings):

1. In the capture card's own HDMI compatibility settings, remove every EDID profile above 1440p.
2. Remove `video=DP-1:1920x1080@60` from `cmdline.txt`.
3. Set `vram.txt` to `0x80000000` (2 GB).

## Elgato

Results vary a lot between models and firmware versions. HDCP handling in particular seems inconsistent from one unit to the next.

- **Elgato 4K X:** works with the default configuration for some users and gives a black screen for others with the same model. A firmware difference is suspected, so update the capture card's firmware if you have problems.
- **Elgato HD60 X:** shows 4K60 HDR correctly in the PS5 OS, but Linux only outputs 1080p60. Switching to 4K60 or enabling HDR in Linux causes a black screen. Unresolved.

## HDCP

Whether a capture card needs HDCP on, off, or an HDCP-stripping splitter varies between devices and setups. Some users need a splitter before their card picks up any signal; others have it working fine without one. If you're stuck, try both HDCP settings on the PS5 and, if you have one, an HDCP stripper.

## Switching between a TV and a capture card without rebooting

If you use both a TV or monitor and a capture card, `arandr` (a graphical front end for `xrandr`) has let some users switch between them without a full reboot:

```bash
sudo apt install arandr
```

Results are mixed: some users still can't get a picture back after switching and have to reboot anyway.
