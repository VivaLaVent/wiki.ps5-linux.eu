---
title: Fan control
sidebar_position: 9
description: How the PS5 fan is controlled under Linux, the hwmon driver's temperatures and curve, and how to adjust it.
---

# Fan control

:::tip[Automatic on recent kernels]
rmux has added hwmon fan curve control to both ps5-linux-patches repositories (the original and his own). The fan now adjusts its speed to the APU temperature automatically, so if your kernel is up to date, you don't need to set anything manually. The options below are for fine-tuning.
:::

The fan is driven by the ICC's autoservo firmware. The kernel sets a target SoC temperature and the firmware ramps the fan up or down by itself to hold that temperature. There is no manual PWM or RPM control, only the target.

The kernel driver lives in `drivers/ps5/fan/` (merged in `ps5-linux-patches` #25). The default target is 80 °C.

## Sysfs interface

```text
/sys/bus/platform/devices/ps5-fan/target_temp
```

Read the current target:

```bash
cat /sys/bus/platform/devices/ps5-fan/target_temp
```

Set a lower target for more aggressive cooling (louder, but keeps the SoC cooler under load), for example 65 °C:

```bash
echo 65 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp
```

The valid range is 0–100 °C. There is no need to force a fixed "max" setting: once it has a target, the servo ramps up as needed. Pick a temperature you're happy with.

**Reported idle temperatures:** with the default 80 °C target, the SoC idles around 59 °C. A target of about 40 °C brings idle down to about 46 °C, but the fan is then constantly audible ("jet mode"). Going lower gives little benefit, as the servo is already close to its maximum.

## hwmon driver

Newer kernels expose the fan as a standard hwmon device, `ps5_fan`, next to the `target_temp` interface above. Upstream #60 and the `meower` branch share the driver; the PS5 Bazzite Deck build of it is [`ps5-fan-hwmon-curve.patch`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.0/patches/ps5-fan-hwmon-curve.patch), applied to Linux v7.3 plus `meower` at `baee34d`. Credits: Armandas Kvietkus (rmuxnet) for the driver, Borchev for the Pro fix (upstream #66): the Pro hands its MainSoC zone over in manual mode, which made the driver fail to probe.

Find it:

```bash
grep -l ps5_fan /sys/class/hwmon/hwmon*/name
```

| Attribute | Meaning |
| --- | --- |
| `temp1_input` to `temp5_input` | Fan zone temperatures `MainSoC`, `Local1` to `Local3`, and `Local4` (ICC sensor 18), in millidegrees. |
| `fan1_input` | Fan speed in RPM. |
| `pwm1` | Current fan duty. |
| `pwm1_enable` | `2` = the console's own firmware control (the default), `3` = the kernel's curve, `1` = manual, `0` = full speed. |
| `pwm1_auto_point1_temp` to `pwm1_auto_point8_temp`, `..._pwm` | The kernel curve: up to eight temperature and duty points, used when `pwm1_enable` is `3`. |
| `pwm1_auto_point1_temp_hyst` | Hysteresis for the curve's first point. |

With `pwm1_enable` at `2`, the firmware's autoservo runs the fan toward `target_temp` as described above; this is what every image has done so far. The kernel curve is opt-in. After an emergency (the firmware ran the fan at maximum), the driver returns to firmware control, not to the curve.

:::note[Upstream default differs]
Upstream's version of the driver starts in kernel-curve mode (`pwm1_enable` `2` is the curve there, and there is no firmware mode). The table above describes the PS5 Bazzite Deck variant. Check `pwm1_enable` and the driver's boot log line on your kernel before relying on either.
:::

**User tools:** [ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin) (a Decky plugin for Game Mode) and [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) (desktop) by NotHavocc set the fan target and show the temperatures; they handle kernels with and without `target_temp`.

## ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) wraps the fan target (as well as the LED, buzzer and GPU clock) in a TUI, CLI and web control panel:

```bash
sudo ps5ctl --temp 65
```

Or use the **Fan** tab in `sudo ps5ctl`.

## Standalone fan_mode kernel module

A separate, minimal alternative for benchmarking. It forces the fan into a fixed EMC mode (auto, max or min) instead of following a target temperature. It was reverse-engineered directly from the EMC ICC commands.

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

There is no percentage setting: the EMC only supports auto, max and min. Max is loud; testers describe it as "turbine mode".

## No separate GPU temperature sensor

The CPU and GPU share one die, so there is no GPU-only temperature reading. The only value is the combined APU temperature, `Tctl`:

```bash
cat /sys/class/hwmon/hwmon*/temp*_label   # find Tctl
cat /sys/class/hwmon/hwmon*/temp*_input   # value in millidegrees Celsius
```

This question has come up repeatedly since early testing. `Tctl` is the closest available number and covers both the CPU and GPU.

**Reference reading:** with the GPU at its minimum clock (400 MHz, from `/sys/class/devfreq/ps5-gpufreq/cur_freq`), `Tctl` was **42.75 °C**. The CPU normally idles at about 798 MHz, but an active SSH session at the time of the reading kept the cores busier (roughly 1.6–3.2 GHz).
