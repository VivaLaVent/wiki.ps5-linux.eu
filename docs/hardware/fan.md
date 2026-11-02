---
title: Fan control
sidebar_position: 9
description: How the PS5 fan is controlled under Linux on each kernel, the hwmon driver's curve and temperatures, and how to adjust them.
---

# Fan control

The fan is driven by the console's EMC through its autoservo firmware. Linux can either hand it a target temperature and let the firmware ramp the fan, or set the duty itself from a temperature curve. Which one you have depends on the kernel:

| Kernel | Default | Interface |
| --- | --- | --- |
| [rmuxnet 7.3.1](/advanced/kernel) and upstream 7.2.3 since #60 (packages from 28 October 2026) | Kernel curve, on at boot. Nothing to install. | hwmon `ps5_fan`, `pwm1_enable` `2` is the curve. |
| [PS5 Bazzite Deck](/installation/bazzite-deck) 2.0.1 | Firmware control toward an 80 °C target, set by the driver at boot; `ps5-perf` can change it. | hwmon `ps5_fan` plus `target_temp`; `pwm1_enable` `2` is the curve, `3` the firmware. |
| Older upstream kernels (before #60) | Firmware control toward `target_temp`, 80 °C by default. Before the fan driver (#25, July 2026) the fan was off until `ps5_control --fan on`. | `target_temp` only. |

**Credits:** Armandas Kvietkus (rmuxnet) for the drivers, c0w for the EMC reverse engineering, Borchev for the Pro fix (upstream #66): the Pro hands its MainSoC zone over in manual mode, which made the driver fail to probe.

## hwmon driver

Find the device:

```bash
grep -l ps5_fan /sys/class/hwmon/hwmon*/name
```

| Attribute | Meaning |
| --- | --- |
| `temp1_input` to `temp4_input` | Fan zone temperatures `MainSoC` and `Local1` to `Local3`, in millidegrees. PS5 Bazzite Deck adds `temp5_input`, `Local4` (ICC sensor 18). |
| `pwm1` | Fan duty, 0 to 255. Read it for the current duty; write it in manual mode. |
| `pwm1_enable` | `0` = full speed, `1` = manual (`pwm1`), `2` = the kernel curve. PS5 Bazzite Deck adds `3`, the firmware's autoservo, and starts there. |
| `pwm1_auto_point1_temp` to `pwm1_auto_point8_temp`, `..._pwm` | The curve: eight temperature and duty points. |
| `pwm1_auto_point1_temp_hyst` | The temperature below which the fan stops, 45 °C by default. |
| `curve_reset` | Write `1` to restore the default curve. |
| `fan1_input` | Fan speed in RPM. PS5 Bazzite Deck only. |

The default curve (rmuxnet's "quiet" curve) is:

| MainSoC | 50 °C | 60 °C | 65 °C | 70 °C | 75 °C | 80 °C | 85 °C | 87 °C |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Duty | 10% | 30% | 40% | 50% | 65% | 80% | 95% | 100% |

Below 45 °C the fan stops. The duty follows a filtered temperature, with slew limiting, so the fan doesn't hunt; above 80 °C it follows the raw reading. At **90 °C** the driver goes to full speed and stays there until the SoC is below 85 °C, in any mode; if the hardware stops answering it falls back to the firmware's own control. The boot log says `quiet fan curve enabled; configure through hwmonN`.

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
The image starts in firmware mode (`pwm1_enable` `3`) with an 80 °C target that the driver sets at boot (`ps5-perf` can change it); the curve is opt-in with `2`, and writing `target_temp` returns to firmware control. After an emergency the driver returns to firmware control, not to the curve. v2.0.0 had the modes the other way round, which confused fan tools; v2.0.1 matches upstream. Its build of the driver is [`ps5-fan-hwmon-curve.patch`](https://github.com/VivaLaVent/ps5-bazzite-deck/blob/v2.0.1/patches/ps5-fan-hwmon-curve.patch).
:::

**User tools:** [ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin) (a Decky plugin for Game Mode) and [ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui) (desktop) by NotHavocc set the fan and show the temperatures; they handle kernels with and without `target_temp`.

## Target temperature (older kernels and PS5 Bazzite Deck)

Kernels without the curve, and PS5 Bazzite Deck in its default mode, only set a target SoC temperature. The firmware ramps the fan up or down by itself to hold it; there is no duty control.

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

The valid range is 0 to 100 °C. There is no need to force a fixed "max" setting: once it has a target, the servo ramps up as needed. Pick a temperature you're happy with.

**Reported idle temperatures:** with the default 80 °C target, the SoC idles around 59 °C. A target of about 40 °C brings idle down to about 46 °C, but the fan is then constantly audible ("jet mode"). Going lower gives little benefit, as the servo is already close to its maximum.

On kernels from before the fan driver (July 2026) the fan is off until something turns it on. `ps5_control --fan on` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) does that, and its `install.sh` installs `ps5fan.service` so it happens at every boot, see [Clocks and boost](/hardware/gpu#clocks-and-boost).

## ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) wraps the fan target (as well as the LED, buzzer and GPU clock) in a TUI, CLI and web control panel. It needs a kernel with `target_temp`, which rmuxnet's 7.3.1 kernel no longer has:

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

The module has no percentage setting, only the EMC's auto, max and min modes; for a duty, use the hwmon driver above. Max is loud; testers describe it as "turbine mode".

## No separate GPU temperature sensor

The CPU and GPU share one die, so there is no GPU-only temperature reading. The only value is the combined APU temperature, `Tctl`, which `k10temp` reports (the current kernels bind it to the PS5's CPU model `0x48`):

```bash
cat /sys/class/hwmon/hwmon*/temp*_label   # find Tctl
cat /sys/class/hwmon/hwmon*/temp*_input   # value in millidegrees Celsius
```

This question has come up repeatedly since early testing. `Tctl` is the closest available number and covers both the CPU and GPU.

**Reference reading:** with the GPU at its minimum clock (400 MHz, from `/sys/class/devfreq/ps5-gpufreq/cur_freq`), `Tctl` was **42.75 °C**. The CPU normally idles at about 798 MHz, but an active SSH session at the time of the reading kept the cores busier (roughly 1.6–3.2 GHz).
