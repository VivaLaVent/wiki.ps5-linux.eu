---
title: Fan control
sidebar_position: 8
description: How the PS5 fan is controlled under Linux on each kernel, the hwmon driver's curve and temperatures, and how to adjust them.
hardware: [original, slim, pro]
applies_to: all
---

# Fan control

The console's embedded controller (EMC) runs the fan through its own "autoservo" firmware. Linux can either hand that firmware a target temperature and let it ramp the fan, or set the fan duty itself from a temperature curve. Which one you start with depends on the kernel:

| Kernel | Default | Interface |
| --- | --- | --- |
| Upstream (current packages) and [rmuxnet's kernel](/post-install/kernel) | Kernel curve, on at boot. Nothing to install. | hwmon `ps5_fan`; `pwm1_enable` `2` is the curve. |
| [PS5 Bazzite Deck](/choose/bazzite-deck) | The console's own firmware control. From v2.7.2 with Sony's own fan table and target, as on the PS5 OS; v2.6.1 to v2.7.1 with the driver's quiet table and an 80 °C target; v2.5 and v2.5.1 started on the kernel curve. | hwmon `ps5_fan` plus `target_temp`; `pwm1_enable` `2` is the curve, `3` the firmware. |
| Older upstream kernels | Firmware control toward `target_temp`, 80 °C by default. The oldest kernels had no fan driver at all and left the fan off until `ps5_control --fan on`. | `target_temp` only. |

## Change it from Game Mode or the desktop {#hwcon}

The easiest way is NotHavocc's PS5 Hardware Control, in two forms that do the same:

- **[ps5-hwcon-plugin](https://github.com/NotHavocc/ps5-hwcon-plugin)** for Game Mode: a [Decky Loader](/post-install/decky) plugin in the quick access menu.
- **[ps5-hwcon-gui](https://github.com/NotHavocc/ps5-hwcon-gui)** for the desktop: a window, no Decky needed.

Its **Fan** tab shows the temperatures and switches between **Target** and **Curve**. On kernels with the hwmon driver, PS5 Bazzite Deck included, it runs every setting as a kernel curve (`pwm1_enable` `2`), a target too: a target there is a curve that reaches 45% at the target and full speed 6 °C above it. **Restore on Startup** re-applies your setting at every start, because the kernel starts from its default again.

To go back to the console's own control on PS5 Bazzite Deck, turn **Restore on Startup** off and restart, or, from v2.7.2:

```bash
sudo ps5-perf fan default
```

On v2.7.1 and older, writing a target returns to the console's control too: `echo 80 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp`.

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

The default curve:

| MainSoC | 50 °C | 60 °C | 65 °C | 70 °C | 75 °C | 80 °C | 85 °C | 87 °C |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Duty | 10% | 30% | 40% | 50% | 65% | 80% | 95% | 100% |

Below 45 °C the fan stops. The duty follows a filtered temperature with slew limiting, so the fan doesn't hunt; above 80 °C it follows the raw reading. At **90 °C** the driver goes to full speed and stays there until the SoC is below 85 °C, in any mode; if the hardware stops answering it falls back to the firmware's own control. The boot log names the mode it started in: on upstream and rmuxnet's kernels `quiet fan curve enabled; configure through hwmonN`, on PS5 Bazzite Deck from v2.7.2 `firmware fan control (Sony's target N C); pwm1_enable 2 is the kernel curve, 3 the firmware, through hwmonN`. The driver doesn't read the fan speed: there is no `fan1_input`.

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
The image starts in firmware mode (`pwm1_enable` `3`); `ps5_fan.curve=1` in `cmdline.txt` starts with the curve instead. Writing `target_temp` (40 to 90) returns to firmware control, and so does the driver after an emergency.

- **From v2.7.2** the firmware runs on Sony's own fan table and target, as on the PS5 OS. The driver uploads its quiet table only for full speed, manual and the curve (`pwm1_enable` `0` to `2`), and puts Sony's back when you return to `3`, for sleep and at shutdown, so the PS5 OS never starts with Linux's settings. `target_temp` takes `0` for Sony's own target.
- **v2.6.1 to v2.7.1** uploaded the quiet table at every start and set an 80 °C target. That kept the fan quiet, but the chip ran warm, the fan spun up at power off and restart, and the PS5 OS could start with Linux's table still in place.
- **v2.5 and v2.5.1** started on the curve and kept the firmware's lower target during sleep and shutdown.
:::

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

The driver accepts 0 to 100 °C (PS5 Bazzite Deck from v2.6.1: 40 to 90 °C, and from v2.7.2 `0` for Sony's own target). On PS5 Bazzite Deck from v2.7.2, `sudo ps5-perf fan 65` sets it and keeps it across restarts (`FAN_TARGET` in `/etc/ps5-bazzite-deck/perf.conf`), and `sudo ps5-perf fan default` goes back to Sony's. A very low target doesn't make the fan a "max" switch: the firmware ramps as far as it needs to for any target, and below roughly 40 °C the fan is constantly audible while the SoC temperature barely moves any more. Pick a target you are happy to listen to.

On the oldest kernels, without a fan driver, the fan stays off until `ps5_control --fan on` from [ps5-linux-tools](https://github.com/ps5-linux/ps5-linux-tools) turns it on; its `install.sh` installs `ps5fan.service` so that happens at every boot, see [Clocks and boost](/troubleshooting/gpu#clocks-and-boost).

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

On a PS5 Pro the SMU backend adds a GPU temperature of its own, see [PS5 Pro](/troubleshooting/ps5-pro#gpu-driver).

The GPU clock is reported by the devfreq driver of your kernel: look under `/sys/class/devfreq/` for the device name (`ps5-gpufreq` on current kernels) and read its `cur_freq`. At idle the clock sits at the governor's minimum.

## Fan problems

- **The fan spins up at power off and restart** (PS5 Bazzite Deck v2.6.1 to v2.7.1): most likely the 80 °C target: the chip runs warm, and the console's firmware cools it once Linux hands the fan back. v2.7.2 runs on Sony's own target, which keeps the chip cooler; report whether that ends it. On older releases, a lower target (`echo 70 | sudo tee /sys/bus/platform/devices/ps5-fan/target_temp`) shortens the spin-up.
- **The PS5 OS fan runs fast after using Linux** (reported on v2.7): up to v2.7.1 the console's fan control could keep Linux's table after a shutdown. v2.7.2 puts Sony's back at every shutdown; if it still happens, report it with `ps5-report`.
- **Louder and hunting at idle on PS5 Bazzite Deck v2.5 and v2.5.1** (`ps5-perf status` shows `kernel curve`): the 7.3.1 kernel started on its own curve. v2.6.1 returns to the console's firmware control. Until you update, a quieter curve from [PS5 Hardware Control](#hwcon) helps.
- **Target back at 50 °C after sleep:** some PS5 Bazzite Deck releases; fixed in the current one.
- **Fan or CPU boost off:** on upstream kernels the CPU boost is off until you install `ps5-linux-tools` and enable `ps5boost.service`; older upstream kernels also needed `ps5fan.service`, current ones run a fan curve by themselves. On rmuxnet's kernel the fan curve and the GPU clock are automatic and the CPU boost is a sysfs switch; on PS5 Bazzite Deck both are on. See [Other distros](/post-install/not-bazzite-deck#3-fan-boost-and-clocks) and [Clocks and boost](/troubleshooting/gpu#clocks-and-boost).
