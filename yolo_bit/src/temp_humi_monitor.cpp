#include "temp_humi_monitor.h"
#include "config.h"
#include "DHT20.h"
#include <Wire.h>

DHT20 dht20;

void temp_humi_monitor(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;
    
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN); 
    if (!dht20.begin()) {
        Serial.println("[SENSOR] ERROR: DHT20 initialization failed on I2C bus.");
    } else {
        Serial.println("[SENSOR] DHT20 initialized successfully.");
    }

    while(1) {
        dht20.read();
        float temp = dht20.getTemperature();
        float humi = dht20.getHumidity();
        
        // Remove heavy serial prints here, rely on MQTT task to print unified state 
        // to avoid clashing console outputs between tasks

        xSemaphoreTake(ctx->mutex, portMAX_DELAY);
        ctx->currentTemp = temp;
        ctx->currentHumi = humi;
        xSemaphoreGive(ctx->mutex);
        
        // Logic threshold signals
        if (temp > 28.0) xSemaphoreGive(ctx->semWarningTemp);
        
        vTaskDelay(pdMS_TO_TICKS(5000)); // 5-second interval
    }
}
