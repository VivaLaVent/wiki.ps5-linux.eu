---
title: "Updating: Legacy"
sidebar_label: Legacy
sidebar_position: 2
description: "Update a Legacy PS5 Bazzite Deck install in place, to the latest release or a specific one."
hardware: [original, slim, pro]
applies_to: bazzite-deck
---

# Updating: Legacy

Legacy installs are PS5 Bazzite Deck installs from before v2.5. On the PS5, in a terminal (Desktop Mode → **Konsole**) or over SSH (password `ps5`), update in place to the release marked **Latest**:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/tools/update-latest.sh)
```

For a specific release, pre-releases included, put its version from the [releases page](https://github.com/VivaLaVent/ps5-bazzite-deck/releases) at the end:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/VivaLaVent/ps5-bazzite-deck/main/tools/update-latest.sh) v2.7.3
```

Then power off and start with the loader. The command prints how to undo the update. Switching to bootc is recommended, see [Built with bootc](/choose/bazzite-deck#built-with-bootc); it means flashing the bootc image, which erases the drive.

