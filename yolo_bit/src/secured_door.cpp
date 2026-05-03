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
        // Usually, IR sensors trigger LOW when obstacle is present, or HIGH depending on the module.
        // Assuming HIGH = movement detected for this scenario.
        static bool last_ir_status = false;
        int ir_status = digitalRead(PIN_IR_SENSOR);
        
        if (ir_status == HIGH && !last_ir_status) { 
            if (cmdState == DOOR_LOCKED) {
                Serial.println("[SECURITY] EXCEPTION: Unauthorized entry! System is LOCKED.");
                xSemaphoreTake(ctx->mutex, portMAX_DELAY);
                ctx->intrusionDetected = true;
                xSemaphoreGive(ctx->mutex);
            }
        }
        last_ir_status = (ir_status == HIGH);

        vTaskDelay(pdMS_TO_TICKS(100)); // Polling at 10Hz to be responsive
    }
}
