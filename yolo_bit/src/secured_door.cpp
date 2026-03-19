#include "secured_door.h"
#include "config.h"

void secured_door_task(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;
    
    pinMode(PIN_RELAY, OUTPUT);
    pinMode(PIN_IR_SENSOR, INPUT);
    
    // Default unlocked
    digitalWrite(PIN_RELAY, LOW); 

    while(1) {
        DoorState cmdState;
        
        xSemaphoreTake(ctx->mutex, portMAX_DELAY);
        cmdState = ctx->currentDoorState;
        xSemaphoreGive(ctx->mutex);
        
        // Execute Door state requested by MQTT
        if (cmdState == DOOR_LOCKED) {
            digitalWrite(PIN_RELAY, HIGH); // Assuming HIGH = Locked
        } else {
            digitalWrite(PIN_RELAY, LOW);  // Assuming LOW = Unlocked
        }

        // Read door status (IR sensor for intrusion)
        int ir_status = digitalRead(PIN_IR_SENSOR);
        if (ir_status == HIGH) { 
            // Example logic: door movement detected
            if (cmdState == DOOR_LOCKED) {
                // Unauthorized!
                Serial.println("[SECURITY] EXCEPTION: Unauthorized entry! System is LOCKED.");
            } else {
                // General telemetry, but limit print spam (e.g. only print on edge change in production)
                // Serial.println("[SECURITY] Door movement detected.");
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}
