---
title: LED, buzzer and capture cards
sidebar_label: Peripherals
sidebar_position: 11
description: "The PS5's light bar, buzzer and HDMI capture cards under Linux: control from sysfs, and capture cards that show nothing."
hardware: [original, slim, pro]
applies_to: all
---

# LED, buzzer and capture cards

## Light bar (LED) {#led}

The light bar on the front and the small standby LED are controlled by the console's internal controller chip (ICC). The PS5 kernel has a driver for them under `drivers/ps5/led/` that exposes Sony's own colour presets through sysfs.

### Sysfs interface

Each preset has its own LED device:

```text
/sys/class/leds/ps5:<preset>:indicator/brightness
```

Write `1` to activate a preset:

```bash
echo 1 | sudo tee /sys/class/leds/ps5:purple:indicator/brightness
```

Turn the LED off:

```bash
echo 1 | sudo tee /sys/class/leds/ps5:off:indicator/brightness
```

List the available presets:

```bash
ls /sys/class/leds/ | grep ps5
```

Full list of presets:

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

[ps5ctl](https://github.com/rmuxnet/ps5ctl) also lets you pick a preset from a TUI, CLI or web panel, and the [PS5 hardware control](https://github.com/NotHavocc/ps5-hwcon-plugin) Decky plugin does the same in Game Mode.

### Hardware notes

There are two separately driven zones:

- **Zone A** is the light bar itself, with blue, white and orange channels.
- **Zone B** is the small LED by the power button that pulses while the console is in standby. It stays dark while you use the desktop.

The three channels mix in the eye rather than on the hardware: a bright blue or white swamps the orange, which is why the pink and purple presets run orange near full and keep the others low.

### Boot status LED

The orange and white states you see while the loader hands over to Linux come from the console's firmware, not from these presets. See [Reading the LED](/installation/booting#reading-the-led).

## Buzzer {#buzzer}

The small piezo speaker in the console, the one that beeps when you press the power button, can be driven from Linux. The PS5 kernel's buzzer driver sends the request over the ICC, the same path the LED driver uses.

### Sysfs interface

```text
/sys/class/misc/ps5_buzzer/beep
```

Write a level from 0 to 3:

| Value | Sound |
| --- | --- |
| 0 | Silent |
| 1 | Short beep |
| 2 | Error beep |
| 3 | Long beep |

```bash
echo 1 | sudo tee /sys/class/misc/ps5_buzzer/beep   # short
echo 2 | sudo tee /sys/class/misc/ps5_buzzer/beep   # error
echo 3 | sudo tee /sys/class/misc/ps5_buzzer/beep   # long
```

A second attribute, `stop`, exists for the driver's pattern player (`/dev/ps5_buzzer` with the `PS5_BUZZER_PLAY` ioctl) and interrupts a pattern that is playing. The three beeps above don't need it.

```bash
echo 1 | sudo tee /sys/class/misc/ps5_buzzer/stop
```

### ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) names the three levels:

```bash
sudo ps5ctl --buzz --list      # Short, Error, Long
sudo ps5ctl --buzz Short
```

Or use the **Buzzer** tab in `sudo ps5ctl`.

## Capture cards {#capture-cards}

To the kernel a capture card is a display: it reads the card's EDID and offers the modes the card announces, so a card that shows nothing has the same causes as a monitor that shows nothing. Work through [Troubleshooting a black screen](/troubleshooting/display#black-screen) first.

### Which modes work

Cards differ in which of the console's modes they accept. The pattern across reports:

| Mode | Typical result |
| --- | --- |
| 1080p60 | Works on every card that works at all |
| 1440p60 | Works on cards that announce it, often only after trimming the card's EDID (below) |
| 1080p120, 1440p120, 4K60, HDR | Mixed: some 4K cards take them, many show nothing, and a card that handles 4K60 HDR from the PS5 OS can still only take 1080p60 from Linux |

If a card is black at a higher mode, pick a lower one from a shell, see [Display recovery](/troubleshooting/display#display-recovery), and leave `video=DP-1:1920x1080@60` in `cmdline.txt` so each boot starts at 1080p60.

### Trim the card's EDID

Most cards let you choose which EDID profiles they present to the source. A black screen at 1440p60 with the defaults has been fixed by:

1. removing every profile above 1440p in the card's own HDMI or EDID settings,
2. removing `video=DP-1:1920x1080@60` from `cmdline.txt`, so the desktop can switch to 1440p,
3. giving the GPU more reserved memory, `vram.txt` at `80000000` (2 GB), see [VRAM](/troubleshooting/gpu#vram).

### Firmware of the card

The same card model works for one person and stays black for another. The difference is often the card's own firmware. Update it from the vendor's tool before you look for the cause on the console.

### HDCP

Whether a card wants HDCP on, HDCP off, or an HDCP-stripping splitter in front of it depends on the card. Try both HDCP settings in the PS5 OS first; if the card still sees no signal, a splitter that removes HDCP usually gets it through.

### Switching between a TV and a capture card

With both a display and a capture card connected through a switch, moving the output from one to the other at runtime works some of the time. On an X11 desktop, `arandr` (a graphical front end for `xrandr`) lets you re-enable the output after a switch; on Wayland, use the desktop's display settings or `kscreen-doctor` over SSH, see [Display recovery](/troubleshooting/display#change-the-mode-from-a-desktop). When the picture doesn't come back, a restart is the reliable way.
