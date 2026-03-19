#include "secured_door.h"
#include "config.h"

void secured_door_task(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;
    
    pinMode(PIN_RELAY, OUTPUT);
    pinMode(PIN_IR_SENSOR, INPUT);
    
    digitalWrite(PIN_RELAY, LOW); // Default unlocked/locked depending on relay

    while(1) {
        // Read door status
        int ir_status = digitalRead(PIN_IR_SENSOR);
        
        if (ir_status == HIGH) { // Example logic: door opened
            Serial.println("Door Movement Detected!");
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
