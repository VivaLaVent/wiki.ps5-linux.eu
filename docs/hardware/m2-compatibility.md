---
title: M.2 compatibility list
sidebar_position: 7
description: Community-tested results for the Gen3 NVMe unlock, by firmware and drive.
---

# M.2 compatibility list

Community-tested results for the Gen3 NVMe unlock. See [Gen3 NVMe unlock](./usb-storage.md#gen3-nvme-unlock) for how to do it.

:::info[Share your result]
Add your result with the [submission form](https://forms.gle/bu1uFZdurwUoMYTq5).
:::

## Results by firmware

Every report on 4.xx worked. On later firmware most reports fail, but the same shared dump that failed for some has succeeded for others on the same version, so the failures look like a wrong dump or a wrong procedure rather than a firmware block. If it doesn't work for you, make your own dump from a PS5-formatted Gen4 drive instead of using a shared one.

| PS5 firmware | Gen3 unlock result |
| --- | --- |
| 4.00, 4.03, 4.51 | ✅ Confirmed working, every report |
| 5.02, 5.10 | ❌ Reported failing |
| 10.xx to 13.xx | ⚠️ Mostly failing, with isolated successes on 11.xx and 13.xx |

## All results

"Dump used" says where the 2 MB header came from: *bringus* (the shared dump from the video linked on [Gen3 NVMe unlock](./usb-storage.md#gen3-nvme-unlock)), *netflix* (another shared dump that circulates on Discord) or *personal* (made by the tester). "Dump source" is the drive a personal dump was taken from, when known.

| Worked | PS5 FW | Drive | Capacity | Dump used | Dump source |
| --- | --- | --- | --- | --- | --- |
| ✅ | 4.00 | Phison ESMP512GKB4C3-E13TS | 512 GB | bringus | |
| ✅ | 4.00 | KIOXIA KBG40ZNS128G | 128 GB | bringus | |
| ✅ | 4.00 | Samsung PM981a MZVLB256HBHQ-000H1 | 256 GB | bringus | |
| ❌ (SATA) | 4.00 | Foresee E2M2 FE2H0M064G-B5X10 | 64 GB | bringus | |
| ✅ | 4.00 | Crucial P3 4TB 2280 | 4 TB | personal | |
| ✅ | 4.00 | Samsung PM871b MZNLN256HAJ1-000L7 | 256 GB | netflix | |
| ✅ | 4.03 | Lexar SL300 (shucked) | 1 TB | netflix | |
| ✅ | 4.03 | Lexar SL300 (shucked) | 1 TB | bringus | |
| ✅ | 4.03 | AirDisk 512GB SSD | 512 GB | netflix | |
| ✅ | 4.03 | Crucial P1 CT1000P1SSD8 | 1 TB | bringus | |
| ✅ | 4.51 | KIOXIA KBG40ZNS256G | 256 GB | netflix | |
| ❌ | 5.02 | Samsung PM961 MZVLW256HEHP-000H1 | 256 GB | netflix | |
| ❌ | 5.02 | Samsung PM961 MZVLW256HEHP-000H1 | 256 GB | bringus | |
| ❌ | 5.10 | Samsung 970 EVO Plus MZ-V7S500 | 500 GB | bringus | |
| ❌ | 5.10 | Samsung 970 EVO Plus MZ-V7S500 | 500 GB | personal | Samsung 990 PRO MZ-V9P1T0 |
| ❌ | 10.01 | Samsung 970 EVO Plus MZ-V7S2T0 | 2 TB | bringus | |
| ❌ | 10.40 | WDS100T3B0C | 1 TB | personal | WD_BLACK SN850X WDBAPY0010BNC |
| ❌ | 11.40 | Samsung 970 EVO Plus MZ-V7S500BW | 500 GB | bringus | |
| ❌ | 11.60 | Kingston 0M3PDP3512B | 512 GB | bringus | |
| ❌ | 11.60 | Kingston 0M3PDP3512B | 512 GB | personal | |
| ✅ | 11.60 | Crucial P2 CT2000P2SSD8 | 2 TB | personal | Seagate FireCuda 530 1TB ZP1000GM3A023 |
| ❌ | 11.60 | Intel 660p | 512 GB | bringus | |
| ❌ | 12.00 | ADATA SX8200 PRO | 2 TB | bringus | |
| ❌ | 12.40 | Crucial P2 CT1000P2SSD8 | 1 TB | bringus | |
| ❌ | 12.40 | Crucial P2 CT1000P2SSD8 | 1 TB | personal | Movespeed YSSDHB-2TN7000 |
| ❌ | 13.00 | ARDOR GAMING Ally AL1284 | 512 GB | bringus | |
| ❌ | 13.00 | ARDOR GAMING Ally AL1284 | 512 GB | netflix | |
| ❌ | 13.20 | Kingston | – | bringus | |
| ❌ | 13.20 | WD SN720 SDAPNTW-512G-1014 | 512 GB | bringus | |
| ❌ | 13.40 | Samsung PM981a MZVLB256HBHQ-000L7 | 256 GB | bringus | |
| ❌ | 13.40 | Samsung PM981a MZVLB256HBHQ-000L7 | 256 GB | personal | Samsung 980 Pro 2TB |
| ❌ | 13.40 | KingSpec NE2280 | 256 GB | bringus | |
| ✅ | 13.40 | KingSpec Series NX-4TB 2280 | 4 TB | bringus | |
| ❌ | 13.40 | SK hynix HFM256GDHTNI-87A0B | 256 GB | bringus | |
| ❌ | 13.40 | SK hynix HFM256GDHTNI-87A0B | 256 GB | personal | SSSTC CL4-3D512-Q11 |
