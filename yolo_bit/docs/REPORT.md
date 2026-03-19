# REPORT

## Last prompt report goes here

**Date:** March 19, 2026
**Role:** Senior Hardware Engineer
**Task Executed:** 
1. Re-construct project with better modularization and organization (Separating `.cpp` in `src/` and `.h` in `include/`).
2. Implement FreeRTOS tasks and Semaphores for inter-task communication.

**Details:**
- **`include/config.h` & `include/global.h`:** Defined application-wide Constants, pin configurations, and an `AppContext` structure to hold FreeRTOS Semaphores.
- **`src/main.cpp`:** Cleaned up. It now only allocates `AppContext` Semaphores and spawns 3 core tasks: `day_night_task`, `temp_humi_monitor`, and `secured_door_task`. The standard Arduino `loop()` correctly yields via `vTaskDelete(NULL);`.
- **Modular Tasks:** 
  - `src/day_night_mode.cpp` / `include/day_night_mode.h`: Reads light sensor block (1s tick) and updates NeoPixel LEDs with `semDark` / `semBright` binary semaphore signals.
  - `src/temp_humi_monitor.cpp` / `include/temp_humi_monitor.h`: Reads DHT20 (5s tick) using default `Wire` library instances and issues threshold warnings.
  - `src/secured_door.cpp` / `include/secured_door.h`: Scaffolding for relay logic & optional IR entry sensing (1s tick).
- Verified `lib/` files were left untouched while referencing them natively.
