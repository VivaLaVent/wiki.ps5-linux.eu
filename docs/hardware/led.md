---
title: LED control
sidebar_position: 8
description: Control the PS5's front light bar and standby LEDs from Linux.
---

# LED control

The front light bar and standby LEDs are driven by the ICC (Internal Controller Chip). A preset-based driver is built into the kernel under `drivers/ps5/led/` (merged in `ps5-linux-patches` #21, commit `6cfe53c`).

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

[ps5ctl](https://github.com/rmuxnet/ps5ctl) also lets you control the LED from a TUI, CLI or web panel.

## Hardware notes

The LED has two zones that can be controlled separately:

- **Zone A:** the main front light bar (blue, white and orange channels).
- **Zone B:** a secondary LED near the power button, used for the standby "breathing" animations. You won't see it during normal desktop use.

The channels overlap in perceived colour: at high brightness, blue and white both wash out orange. That's why the pink and purple presets keep orange near maximum and the other channels low.

## Boot status LED

The orange and white LED states you see while the loader hands over to Linux are separate from these presets. See [Reading the LED](/installation/booting#reading-the-led).
