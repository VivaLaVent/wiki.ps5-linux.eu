---
title: Buzzer
sidebar_position: 8
description: Make the PS5's built-in buzzer beep from Linux.
---

# Buzzer

The PS5's built-in piezo buzzer has a kernel driver that talks to it over the ICC (the same indicator service the LED uses). Merged in `ps5-linux-patches` #12.

## Sysfs interface

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

There is also a `stop` attribute. It cancels a pattern started through the driver's ioctl-based pattern player (`/dev/ps5_buzzer`, `PS5_BUZZER_PLAY`). You don't need it for the basic beeps above.

```bash
echo 1 | sudo tee /sys/class/misc/ps5_buzzer/stop
```

## ps5ctl

[ps5ctl](https://github.com/rmuxnet/ps5ctl) exposes the three beep levels by name:

```bash
sudo ps5ctl --buzz --list      # Short, Error, Long
sudo ps5ctl --buzz Short
```

Or use the **Buzzer** tab in `sudo ps5ctl`.
