---
title: LED, buzzer and capture cards
sidebar_label: Peripherals
sidebar_position: 11
description: "The PS5's light bar, buzzer and HDMI capture cards under Linux: control from sysfs, and capture cards that show nothing."
hardware: [original, slim, pro]
applies_to: all
---

# LED, buzzer and capture cards

## Quick answers

| You want | Do this |
| --- | --- |
| Another light bar colour | `echo 1 \| sudo tee /sys/class/leds/ps5:purple:indicator/brightness`, see [the presets](#led) |
| The light bar off | `echo 1 \| sudo tee /sys/class/leds/ps5:off:indicator/brightness` |
| A beep | `echo 1 \| sudo tee /sys/class/misc/ps5_buzzer/beep` (1 short, 2 error, 3 long), see [Buzzer](#buzzer) |
| A capture card that shows nothing | Start at 1080p60, then [Capture cards](#capture-cards) |
| It from a window | [PS5 Hardware Control](/post-install/decky#ps5-hardware-control) in Game Mode, or [ps5ctl](https://github.com/rmuxnet/ps5ctl) |

## Light bar {#led}

Each preset is a device; write `1` to switch to it. List them with `ls /sys/class/leds/ | grep ps5`:

```text
off, blue_breathe, blue_hint_purple, blue_rich, blue_to_richblue,
blue_white_anim, dim_cool_white, orange_breathe, orange_dim,
pink_breathe, pink_breathe_fast, pink_purple, pink_violet_dim,
purple, purple_white, purplish_blue_white, salmon_pink,
salmon_pink_breathe, soft_blue_purple_1, soft_blue_purple_2,
soft_orange_dim, soft_purple, sunrise, warm_pink_dim,
white_breathe, white_bright, white_dim, white_medium,
zoneb_both_pulse, zoneb_orange_pulse, zoneb_white_pulse
```

The `zoneb_*` presets drive the small LED by the power button. The colours during a start come from the console's firmware, see [Reading the LED](/installation/booting#reading-the-led).

## Buzzer {#buzzer}

```bash
echo 1 | sudo tee /sys/class/misc/ps5_buzzer/beep   # short
echo 2 | sudo tee /sys/class/misc/ps5_buzzer/beep   # error
echo 3 | sudo tee /sys/class/misc/ps5_buzzer/beep   # long
```

`echo 1 | sudo tee /sys/class/misc/ps5_buzzer/stop` stops a pattern that is playing. With ps5ctl: `sudo ps5ctl --buzz Short`.

## Capture cards {#capture-cards}

A capture card is a display to the kernel. First work through [Black screen](/troubleshooting/display#black-screen).

| Mode | Typical result |
| --- | --- |
| 1080p60 | Works on every card that works at all |
| 1440p60 | Works on cards that announce it, often only after trimming the card's EDID (below) |
| 1080p120, 1440p120, 4K60, HDR | Mixed: some 4K cards take them, many show nothing, and a card that handles 4K60 HDR from the PS5 OS can still only take 1080p60 from Linux |

- **Black at a higher mode:** choose a lower one from a shell, see [Get the picture back](/troubleshooting/display#display-recovery), and keep `video=DP-1:1920x1080@60` in `cmdline.txt`.
- **Black at 1440p60:** remove every profile above 1440p in the card's own EDID settings, remove `video=DP-1:1920x1080@60` from `cmdline.txt`, and set `vram.txt` to `80000000` (2 GB), see [VRAM](/troubleshooting/gpu#vram).
- **Works for others, not for you:** update the card's firmware.
- **No signal:** try both HDCP settings in the PS5 OS; otherwise a splitter that removes HDCP.
- **Switching between a TV and a card at runtime** works some of the time. Bring the output back with the desktop's display settings or [`kscreen-doctor`](/troubleshooting/display#change-the-mode-from-a-desktop); otherwise restart.
