#include <Arduino.h>
#include "global.h"
#include "config.h"

// Task Headers
#include "day_night_mode.h"
#include "temp_humi_monitor.h"
#include "secured_door.h"

void setup()
{
  Serial.begin(115200);
  
  AppContext* ctx = new AppContext();
  ctx->mutex = xSemaphoreCreateMutex();
  ctx->semDark = xSemaphoreCreateBinary();
  ctx->semBright = xSemaphoreCreateBinary();
  ctx->semWarningTemp = xSemaphoreCreateBinary();

  // Create tasks for each independent module
  xTaskCreate(day_night_task, "Day/Night Task", STACK_SIZE_SENSOR, ctx, 1, NULL);
  xTaskCreate(temp_humi_monitor, "Temp/Humi Task", STACK_SIZE_SENSOR, ctx, 1, NULL);
  xTaskCreate(secured_door_task, "Secured Door Task", STACK_SIZE_SENSOR, ctx, 1, NULL);
}

void loop()
{
  vTaskDelete(NULL); // FreeRTOS allows loop() to just be deleted to save resources
}