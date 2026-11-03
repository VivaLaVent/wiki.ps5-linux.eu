---
title: Fan control
sidebar_position: 9
description: How the PS5 fan is controlled under Linux on each kernel, the hwmon driver's curve and temperatures, and how to adjust them.
---

# Fan control

The console's embedded controller (EMC) runs the fan through its own "autoservo" firmware. Linux can either hand that firmware a target temperature and let it ramp the fan, or set the fan duty itself from a temperature curve. Which one you start with depends on the kernel:

| Kernel | Default | Interface |
| --- | --- | --- |
| Upstream (current packages) and [rmuxnet's kernel](/advanced/kernel) | Kernel curve, on at boot. Nothing to install. | hwmon `ps5_fan`; `pwm1_enable` `2` is the curve. |
| [PS5 Bazzite Deck](/installation/bazzite-deck) | Firmware control toward an 80 °C target, set by the driver at boot; `ps5-perf` can change it. | hwmon `ps5_fan` plus `target_temp`; `pwm1_enable` `2` is the curve, `3` the firmware. |
| Older upstream kernels | Firmware control toward `target_temp`, 80 °C by default. The oldest kernels had no fan driver at all and left the fan off until `ps5_control --fan on`. | `target_temp` only. |

## hwmon driver

Find the device:

```bash
grep -l ps5_fan /sys/class/hwmon/hwmon*/name
```

| Attribute | Meaning |
| --- | --- |
| `temp1_input` to `temp4_input` | Fan zone temperatures `MainSoC` and `Local1` to `Local3`, in millidegrees. |
| `temp5_input` | `Local4`, the ICC's sensor 18. Part of the upstream driver; rmuxnet's kernel leaves it out. |
| `pwm1` | Fan duty, 0 to 255. Read it for the current duty; write it in manual mode. |
| `pwm1_enable` | `0` = full speed, `1` = manual (`pwm1`), `2` = the kernel curve. PS5 Bazzite Deck adds `3`, the firmware's autoservo, and starts there. |
| `pwm1_auto_point1_temp` to `pwm1_auto_point8_temp`, `..._pwm` | The curve: eight temperature and duty points. |
| `pwm1_auto_point1_temp_hyst` | The temperature below which the fan stops, 45 °C by default. |
| `curve_reset` | Write `1` to restore the default curve. |
| `fan1_input` | Fan speed in RPM, where the console reports it. On a PS5 Pro it reads `n/a`, which is normal. |

The default curve:

| MainSoC | 50 °C | 60 °C | 65 °C | 70 °C | 75 °C | 80 °C | 85 °C | 87 °C |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Duty | 10% | 30% | 40% | 50% | 65% | 80% | 95% | 100% |

Below 45 °C the fan stops. The duty follows a filtered temperature with slew limiting, so the fan doesn't hunt; above 80 °C it follows the raw reading. At **90 °C** the driver goes to full speed and stays there until the SoC is below 85 °C, in any mode; if the hardware stops answering it falls back to the firmware's own control. The boot log names the mode it started in: on upstream and rmuxnet's kernels `quiet fan curve enabled; configure through hwmonN`, on PS5 Bazzite Deck `firmware fan control (pwm1_enable 3, target 80 C); the kernel curve is pwm1_enable 2 through hwmonN`.

A cooler, louder curve, for example 60% from 70 °C:

```bash
H=$(dirname $(grep -l ps5_fan /sys/class/hwmon/hwmon*/name))
echo 153 | sudo tee $H/pwm1_auto_point4_pwm
```

A point's temperature has to stay between its neighbours and at most 90 °C, the duties have to rise with the temperatures and the last point stays at 100%; the driver rejects anything else. Settings don't survive a reboot: put them in a systemd unit or a udev rule.

Manual duty, for example 50%:

```bash
echo 1 | sudo tee $H/pwm1_enable
echo 128 | sudo tee $H/pwm1
```

Back to the curve: `echo 2 | sudo tee $H/pwm1_enable`.

:::note[PS5 Bazzite Deck]
The image starts in firmware mode (`pwm1_enable` `3`) with an 80 °C target that the driver sets at boot (`ps5-perf` can change it); the curve is opt-in with `2`, and writing `target_temp` returns to firmware control. After an emergency the driver returns to firmware control, not to the curve. One pre-release had modes `2` and `3` the other way round, and some releases lost the target after sleep (it came back at 50 °C because the driver re-sent its parameter table on resume); both are fixed in the current release.
:::

**User tools:** [ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin) (a Decky plugin for Game Mode) and [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) (desktop) set the fan and show the temperatures; they handle kernels with and without `target_temp`.

## Target temperature (older kernels and PS5 Bazzite Deck)

Kernels without the curve, and PS5 Bazzite Deck in its default mode, set a target SoC temperature and nothing else. The EMC's firmware then speeds the fan up or slows it down to hold that temperature; you don't set a duty or an RPM.

```text
/sys/bus/platform/devices/ps5-fan/target_temp
```

Read the current target:

```bash
cat /sys/bus/platform/devices/ps5-fan/target_temp
```

Set a lower target for more cooling at the cost of noise, for example 65 °C:

```bash
echo 65 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp
```

The driver accepts 0 to 100 °C. A very low target doesn't make the fan a "max" switch: the firmware ramps as far as it needs to for any target, and below roughly 40 °C the fan is constantly audible while the SoC temperature barely moves any more. Pick a target you are happy to listen to.

On the oldest kernels, without a fan driver, the fan stays off until `ps5_control --fan on` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) turns it on; its `install.sh` installs `ps5fan.service` so that happens at every boot, see [Clocks and boost](/hardware/gpu#clocks-and-boost).

## ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) is a TUI, CLI and web panel for the fan target, the LED, the buzzer and the GPU clock. It needs a kernel with `target_temp`, which rmuxnet's own kernel no longer has:

```bash
sudo ps5ctl --temp 65
```

Or use the **Fan** tab in `sudo ps5ctl`.

## Standalone fan_mode kernel module

A small out-of-tree module for benchmarking, which puts the fan into one of the EMC's fixed modes (auto, max or min) instead of following a target. It talks to the EMC with the same ICC commands the driver uses.

Build it:

```bash
make -C /lib/modules/$(uname -r)/build M=$PWD obj-m=fan_mode.o modules
```

Force maximum speed:

```bash
sudo insmod fan_mode.ko zone=0 fan_mode=2 ; sudo rmmod fan_mode
```

Return to automatic mode:

```bash
sudo insmod fan_mode.ko zone=0 fan_mode=1 ; sudo rmmod fan_mode
```

There is no percentage here, only the three EMC modes; for a duty, use the hwmon driver above. Max is very loud.

## No separate GPU temperature sensor

The CPU and GPU sit on one die, so there is no GPU-only temperature. The number to watch is the APU temperature `Tctl` from `k10temp` (the current kernels bind it to the PS5's CPU model `0x48`); it covers both:

```bash
cat /sys/class/hwmon/hwmon*/temp*_label   # find Tctl
cat /sys/class/hwmon/hwmon*/temp*_input   # value in millidegrees Celsius
```

On a PS5 Pro the SMU backend adds a GPU temperature of its own, see [PS5 Pro](./ps5-pro.md#gpu-driver).

The GPU clock is reported by the devfreq driver of your kernel: look under `/sys/class/devfreq/` for the device name (`ps5-gpufreq` on current kernels) and read its `cur_freq`. At idle the clock sits at the governor's minimum.
