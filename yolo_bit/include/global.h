#ifndef GLOBAL_H
#define GLOBAL_H

#include <Arduino.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

struct AppContext {
    SemaphoreHandle_t mutex;
    SemaphoreHandle_t semInternet;
    SemaphoreHandle_t semNormalTemp;
    SemaphoreHandle_t semWarningTemp;
    SemaphoreHandle_t semCriticalTemp;
    SemaphoreHandle_t semLowHumi;
    SemaphoreHandle_t semNormalHumi;
    SemaphoreHandle_t semHighHumi;
    SemaphoreHandle_t semLcdNormal;
    SemaphoreHandle_t semLcdWarning;
    SemaphoreHandle_t semLcdCritical;
    
    // Day/Night specific
    SemaphoreHandle_t semDark;
    SemaphoreHandle_t semBright;

    // Door monitoring
    SemaphoreHandle_t semDoorLocked;
    SemaphoreHandle_t semDoorUnlocked;
};

#endif // GLOBAL_H
