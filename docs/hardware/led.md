---
title: LED control
sidebar_position: 8
description: Control the PS5's front light bar and standby LEDs from Linux.
---

# LED control

The light bar on the front and the small standby LED are controlled by the console's internal controller chip (ICC). The PS5 kernel has a driver for them under `drivers/ps5/led/` that exposes Sony's own colour presets through sysfs.

## Sysfs interface

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

## Hardware notes

There are two separately driven zones:

- **Zone A** is the light bar itself, with blue, white and orange channels.
- **Zone B** is the small LED by the power button that pulses while the console is in standby. It stays dark while you use the desktop.

The three channels mix in the eye rather than on the hardware: a bright blue or white swamps the orange, which is why the pink and purple presets run orange near full and keep the others low.

## Boot status LED

The orange and white states you see while the loader hands over to Linux come from the console's firmware, not from these presets. See [Reading the LED](/installation/booting#reading-the-led).
