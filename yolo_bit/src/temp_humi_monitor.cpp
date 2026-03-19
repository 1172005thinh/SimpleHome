#include "temp_humi_monitor.h"
#include "config.h"
#include "DHT20.h"
#include <Wire.h>

DHT20 dht20;

void temp_humi_monitor(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;
    
    Wire.begin(); 
    if (!dht20.begin()) {
        Serial.println("DHT20 initialization failed");
    }

    while(1) {
        dht20.read();
        float temp = dht20.getTemperature();
        float humi = dht20.getHumidity();
        
        Serial.print("DHT20 -> Temp: ");
        Serial.print(temp);
        Serial.print("C, Humi: ");
        Serial.print(humi);
        Serial.println("%");
        
        // Logic threshold signals
        if (temp > 28.0) xSemaphoreGive(ctx->semWarningTemp);
        
        vTaskDelay(pdMS_TO_TICKS(5000)); // 5-second interval
    }
}
