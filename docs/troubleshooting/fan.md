---
title: Fan control
sidebar_position: 8
description: How the PS5 fan is controlled under Linux on each kernel, the hwmon driver's curve and temperatures, and how to adjust them.
hardware: [original, slim, pro]
applies_to: all
---

# Fan control

## Quick answers

| Problem | Do this |
| --- | --- |
| 80 °C at idle on PS5 Bazzite Deck | Normal: the console holds its target. To idle cooler, see [Set the fan](#idle) |
| Fan cycles loud and quiet, about 90 °C with a quiet fan, or spins up at power off (PS5 Bazzite Deck up to v2.8) | Update: fixed in v2.8.1 |
| The PS5 OS fan runs fast after Linux | Update to v2.8 or newer: it repairs the fan table at the first start |
| Fan behaves oddly after a restart with PS5 Hardware Control | Turn off its **Restore on Startup**, or update the plugin |
| Fan off or CPU slow on an upstream kernel | `ps5_control` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools), see [Clocks and boost](/troubleshooting/gpu#clocks-and-boost) |

## What runs the fan

| Kernel | Default |
| --- | --- |
| [PS5 Bazzite Deck](/choose/bazzite-deck) from v2.8.1 | The console's own control, with an 80 °C target |
| Upstream packages and [rmuxnet's kernel](/post-install/kernel) | A kernel curve, on at boot |
| Older upstream kernels | The console's control toward `target_temp` (80 °C); the oldest have no fan driver |

## Set the fan on PS5 Bazzite Deck {#idle}

The console keeps the fan slow until the chip reaches its target, idle included. That's safe; clicking after shutdown is the case cooling down. In `cmdline.txt` ([how](/post-install/boot-options)):

- `ps5_fan.target=70`: another target, 40 °C up to Sony's 91. Lower is cooler and louder.
- `ps5_fan.curve=1`: the kernel curve instead, about 60 °C at idle, louder under load.

Back to the console's control without a restart:

```bash
H=$(dirname $(grep -l ps5_fan /sys/class/hwmon/hwmon*/name))
echo 3 | sudo tee $H/pwm1_enable
```

## PS5 Hardware Control {#hwcon}

NotHavocc's tool sets a curve or a target from a window: [ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin) for Game Mode ([Decky](/post-install/decky)) and [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) for the desktop. Every setting runs as a kernel curve. **Restore on Startup** re-applies it at each start; turn it off to stay on the console's control.

## The hwmon driver {#hwmon-driver}

For the kernel curve and manual control. Find it: `grep -l ps5_fan /sys/class/hwmon/hwmon*/name`

| Attribute | Meaning |
| --- | --- |
| `temp1_input` to `temp4_input` | Fan zone temperatures `MainSoC` and `Local1` to `Local3`, in millidegrees. |
| `temp5_input` | `Local4`, the ICC's sensor 18. Part of the upstream driver; rmuxnet's kernel leaves it out. |
| `pwm1` | Fan duty, 0 to 255. Read it for the current duty; write it in manual mode. |
| `pwm1_enable` | `0` = full speed, `1` = manual (`pwm1`), `2` = the kernel curve. PS5 Bazzite Deck adds `3`, the console's own control on Sony's fan table, and starts there. |
| `pwm1_auto_point1_temp` to `pwm1_auto_point8_temp`, `..._pwm` | The curve: eight temperature and duty points. |
| `pwm1_auto_point1_temp_hyst` | The temperature below which the fan stops, 45 °C by default. |
| `curve_reset` | Write `1` to restore the default curve. |

The default curve; below 45 °C the fan stops, and at 90 °C it goes to full speed until 85 °C:

| MainSoC | 50 °C | 60 °C | 65 °C | 70 °C | 75 °C | 80 °C | 85 °C | 87 °C |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Duty | 10% | 30% | 40% | 50% | 65% | 80% | 95% | 100% |

A cooler, louder curve, for example 60% from 70 °C:

```bash
H=$(dirname $(grep -l ps5_fan /sys/class/hwmon/hwmon*/name))
echo 153 | sudo tee $H/pwm1_auto_point4_pwm
```

Manual, for example 50%:

```bash
echo 1 | sudo tee $H/pwm1_enable
echo 128 | sudo tee $H/pwm1
```

Back to the curve: `echo 2 | sudo tee $H/pwm1_enable`. Settings last until the next start. Points must rise in temperature and duty, stay at or below 90 °C, and end at 100%.

## Temperatures

There is no separate GPU sensor: CPU and GPU share one die. Watch `Tctl`:

```bash
cat /sys/class/hwmon/hwmon*/temp*_label   # find Tctl
cat /sys/class/hwmon/hwmon*/temp*_input   # value in millidegrees Celsius
```

The GPU clock is `cur_freq` under `/sys/class/devfreq/`. A PS5 Pro adds a GPU temperature, see [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver).

## Older kernels

**Target temperature** (kernels without the curve, PS5 Bazzite Deck v2.6.1 to v2.7.3):

```bash
cat /sys/bus/platform/devices/ps5-fan/target_temp
echo 65 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp
```

[ps5ctl](https://github.com/rmuxnet/ps5ctl) (`sudo ps5ctl --temp 65`) needs `target_temp` too.

**Fixed fan modes for benchmarking** (`fan_mode` module; max is very loud):

```bash
make -C /lib/modules/$(uname -r)/build M=$PWD obj-m=fan_mode.o modules
```

```bash
sudo insmod fan_mode.ko zone=0 fan_mode=2 ; sudo rmmod fan_mode
```

```bash
sudo insmod fan_mode.ko zone=0 fan_mode=1 ; sudo rmmod fan_mode
```
