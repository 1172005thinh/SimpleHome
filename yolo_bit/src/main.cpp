#include <Arduino.h>
#include "global.h"
#include "config.h"

// Task Headers
#include "day_night_mode.h"
#include "temp_humi_monitor.h"
#include "secured_door.h"
#include "wifi_mqtt.h"
#include "lcd_module.h"

void setup()
{
  Serial.begin(115200);
  
  AppContext* ctx = new AppContext();
  ctx->mutex = xSemaphoreCreateMutex();
  ctx->semDark = xSemaphoreCreateBinary();
  ctx->semBright = xSemaphoreCreateBinary();
  ctx->semWarningTemp = xSemaphoreCreateBinary();
  
  // Initialize shared states
  ctx->currentTemp = 0.0;
  ctx->currentHumi = 0.0;
  ctx->currentLightLevel = 0;
  ctx->currentLightMode = MODE_AUTO;
  ctx->currentDoorState = DOOR_UNLOCKED;
  ctx->intrusionDetected = false;

  // Create tasks for each independent module
  xTaskCreate(lcd_task, "LCD Display Task", STACK_SIZE_LCD, ctx, 1, NULL);
  xTaskCreate(day_night_task, "Day/Night Task", STACK_SIZE_SENSOR, ctx, 1, NULL);
  xTaskCreate(temp_humi_monitor, "Temp/Humi Task", STACK_SIZE_SENSOR, ctx, 1, NULL);
  xTaskCreate(secured_door_task, "Secured Door Task", STACK_SIZE_SENSOR, ctx, 1, NULL);
  
  // Wi-Fi & MQTT Client Task
  xTaskCreate(wifi_mqtt_task, "WiFi/MQTT Task", STACK_SIZE_MQTT, ctx, 2, NULL);
}

void loop()
{
  vTaskDelete(NULL); // FreeRTOS allows loop() to just be deleted to save resources
}