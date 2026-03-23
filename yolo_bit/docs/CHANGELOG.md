# CHANGELOG

## v0.0.1 - 23/03/2026

- Initial project setup and documentation.
- **Modularized Codebase (RTOS):** Disassembled `main.cpp` logic into discrete FreeRTOS tasks.
- **Added Day/Night Task:** Implemented in `day_night_mode.cpp/h`.
- **Added Temp/Humi Task:** Implemented in `temp_humi_monitor.cpp/h`.
- **Added Secured Door Task:** Scaffolding implemented in `secured_door.cpp/h`.
- **Added AppContext:** Utilizing Semaphores for IPC in `global.h` & `config.h`.
- **Added WiFi & MQTT Task:** Integrated `PubSubClient` and `<WiFi.h>` in `wifi_mqtt.cpp/h` to publish real-time telemetry and subscribe to Web Service commands. Updated dependent files (`global.h`, `main.cpp`, `config.h`) to share global sensor data using memory mutexes.
- **Added LCD Screen Display:** Integrated 1602 LCD via `lcd_module.cpp`, utilizing `LiquidCrystal_I2C` drawing physical representations of the Temperature, Humidity, Light and Door Status onto a hardware interface overlay synchronously reading context structs.
- **Changed include** paths in `global.h` from:

```cpp
//this cause a not-found error
#include <FreeRTOS.h>
#include <semphr.h>

//to
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
//this fixes everything
```
