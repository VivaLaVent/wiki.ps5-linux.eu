---
title: M.2 compatibility list
sidebar_position: 5
description: Community-tested results for the Gen3 NVMe unlock, by firmware and drive.
---

# M.2 compatibility list

Community-tested results for the Gen3 NVMe unlock. See [Gen3 NVMe unlock](./usb-storage.md#gen3-nvme-unlock) for how to do it.

:::info[Share your result]
Add your result with the [submission form](https://forms.gle/bu1uFZdurwUoMYTq5).
:::

## Summary

Confirmed working on firmware 4.00, 4.03 and 4.51. Failed reports on 5.xx and higher are probably user error (wrong dump or wrong procedure) rather than a firmware limitation. If it doesn't work for you, make your own dump from a PS5-formatted Gen4 drive instead of using a shared one.

| PS5 firmware | Gen3 unlock result |
| --- | --- |
| 4.00 | ✅ Confirmed working |
| 4.03 | ✅ Confirmed working |
| 4.51 | ✅ Confirmed working |
| 5.02 | ⚠️ Reported failing, probably user error |
| 5.10 | ⚠️ Reported failing, probably user error |
| 10.01 and later | ⚠️ Reported failing, probably user error |

## All results

"Dump used" says where the 2 MB header came from, for example *bringus* (Bringus Studios' shared dump) or *personal* (made by the tester). "Dump source" is the drive a personal dump was taken from, when known.

| User | Worked | PS5 FW | Drive | Capacity | Dump used | Dump source |
| --- | --- | --- | --- | --- | --- | --- |
| Bringus Studios | ✅ | 4.00 | Phison ESMP512GKB4C3-E13TS | 512 GB | bringus | |
| Bringus Studios | ✅ | 4.00 | KIOXIA KBG40ZNS128G | 128 GB | bringus | |
| Bringus Studios | ✅ | 4.00 | Samsung PM981a MZVLB256HBHQ-000H1 | 256 GB | bringus | |
| Bringus Studios | ❌ (SATA) | 4.00 | Foresee E2M2 FE2H0M064G-B5X10 | 64 GB | bringus | |
| noctam.exe | ✅ | 4.00 | Crucial P3 4TB 2280 | 4 TB | personal | |
| Krenano | ✅ | 4.00 | Samsung PM871b MZNLN256HAJ1-000L7 | 256 GB | netflix | |
| HiPmp5 | ✅ | 4.03 | Lexar SL300 (shucked) | 1 TB | netflix | |
| HiPmp5 | ✅ | 4.03 | Lexar SL300 (shucked) | 1 TB | bringus | |
| HiPmp5 | ✅ | 4.03 | AirDisk 512GB SSD | 512 GB | netflix | |
| BigBoiChubbs | ✅ | 4.03 | Crucial P1 CT1000P1SSD8 | 1 TB | bringus | |
| Windfox | ✅ | 4.51 | KIOXIA KBG40ZNS256G | 256 GB | netflix | |
| scentiic | ❌ | 5.02 | Samsung PM961 MZVLW256HEHP-000H1 | 256 GB | netflix | |
| scentiic | ❌ | 5.02 | Samsung PM961 MZVLW256HEHP-000H1 | 256 GB | bringus | |
| IzzyHope58 | ❌ | 5.10 | Samsung 970 EVO Plus MZ-V7S500 | 500 GB | bringus | |
| IzzyHope58 | ❌ | 5.10 | Samsung 970 EVO Plus MZ-V7S500 | 500 GB | personal | Samsung 990 PRO MZ-V9P1T0 |
| IAmChrisAMA | ❌ | 10.01 | Samsung 970 EVO Plus MZ-V7S2T0 | 2 TB | bringus | |
| failsafe65 | ❌ | 10.40 | WDS100T3B0C | 1 TB | personal | WD_BLACK SN850X WDBAPY0010BNC |
| superzeldalink | ❌ | 11.40 | Samsung 970 EVO Plus MZ-V7S500BW | 500 GB | bringus | |
| NotAzzy_ | ❌ | 11.60 | Kingston 0M3PDP3512B | 512 GB | bringus | |
| NotAzzy_ | ❌ | 11.60 | Kingston 0M3PDP3512B | 512 GB | personal | |
| smturkey | ✅ | 11.60 | Crucial P2 CT2000P2SSD8 | 2 TB | personal | Seagate FireCuda 530 1TB ZP1000GM3A023 |
| Blurf | ❌ | 11.60 | Intel 660p | 512 GB | bringus | |
| iamthexfader | ❌ | 12.00 | ADATA SX8200 PRO | 2 TB | bringus | |
| Kuririmu D. Koro | ❌ | 12.40 | Crucial P2 CT1000P2SSD8 | 1 TB | bringus | |
| Kuririmu D. Koro | ❌ | 12.40 | Crucial P2 CT1000P2SSD8 | 1 TB | personal | Movespeed YSSDHB-2TN7000 |
| KEXT | ❌ | 13.00 | ARDOR GAMING Ally AL1284 | 512 GB | bringus | |
| KEXT | ❌ | 13.00 | ARDOR GAMING Ally AL1284 | 512 GB | netflix | |
| Helloyunho | ❌ | 13.20 | Kingston | – | bringus | |
| BladeMaverick | ❌ | 13.20 | WD SN720 SDAPNTW-512G-1014 | 512 GB | bringus | |
| cleanycloth | ❌ | 13.40 | Samsung PM981a MZVLB256HBHQ-000L7 | 256 GB | bringus | |
| cleanycloth | ❌ | 13.40 | Samsung PM981a MZVLB256HBHQ-000L7 | 256 GB | personal | Samsung 980 Pro 2TB |
| rme | ❌ | 13.40 | KingSpec NE2280 | 256 GB | bringus | |
| MarshOfMello | ✅ | 13.40 | KingSpec Series NX-4TB 2280 | 4 TB | bringus | |
| Xperia64 | ❌ | 13.40 | SK hynix HFM256GDHTNI-87A0B | 256 GB | bringus | |
| Xperia64 | ❌ | 13.40 | SK hynix HFM256GDHTNI-87A0B | 256 GB | personal | SSSTC CL4-3D512-Q11 |
