#include "wifi_mqtt.h"
#include "config.h"
#include <WiFi.h>
#include <PubSubClient.h>

WiFiClient espClient;
PubSubClient mqttClient(espClient);
AppContext* globalCtx = nullptr;

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String msg;
    for (unsigned int i = 0; i < length; i++) {
        msg += (char)payload[i];
    }
    
    Serial.println("=====================================");
    Serial.print("[MQTT] Received Control Command at Topic: ");
    Serial.println(topic);
    Serial.print("[MQTT] Payload: ");
    Serial.println(msg);

    if (globalCtx == nullptr) {
        Serial.println("[MQTT] ERROR: Global Context is Null");
        return;
    }

    xSemaphoreTake(globalCtx->mutex, portMAX_DELAY);
    
    if (String(topic) == TOPIC_SUB_LIGHT_CTRL) {
        if (msg == "AUTO") {
            globalCtx->currentLightMode = MODE_AUTO;
            Serial.println("[MQTT] Action: Light Mode set to AUTO");
        } else if (msg == "ON") {
            globalCtx->currentLightMode = MODE_MANUAL_ON;
            Serial.println("[MQTT] Action: Light Mode set to MANUAL ON");
        } else if (msg == "OFF") {
            globalCtx->currentLightMode = MODE_MANUAL_OFF;
            Serial.println("[MQTT] Action: Light Mode set to MANUAL OFF");
        } else {
            Serial.println("[MQTT] WARNING: Unknown Light Command");
        }
    } 
    else if (String(topic) == TOPIC_SUB_DOOR_CTRL) {
        if (msg == "LOCK") {
            globalCtx->currentDoorState = DOOR_LOCKED;
            Serial.println("[MQTT] Action: Door State set to LOCKED");
        } else if (msg == "UNLOCK") {
            globalCtx->currentDoorState = DOOR_UNLOCKED;
            Serial.println("[MQTT] Action: Door State set to UNLOCKED");
        } else {
            Serial.println("[MQTT] WARNING: Unknown Door Command");
        }
    } else {
         Serial.println("[MQTT] WARNING: Unknown Topic received");
    }
    
    xSemaphoreGive(globalCtx->mutex);
    Serial.println("=====================================");
}

void setupWiFi() {
    delay(10);
    Serial.println();
    Serial.println("[WIFI] Initializing Station Mode...");
    Serial.print("[WIFI] Connecting to SSID: ");
    Serial.println(WIFI_SSID);
    Serial.print("[WIFI] Using Password: ");
    Serial.println(WIFI_PASSWORD);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        attempts++;
        if (attempts > 20) {
            Serial.println("\n[WIFI] ERROR: Failed to connect to WiFi array within timeout.");
            return;
        }
    }

    Serial.println("\n[WIFI] Successfully connected to Network.");
    Serial.print("[WIFI] Assigned IP address: ");
    Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
    while (!mqttClient.connected()) {
        Serial.print("[MQTT] Attempting connection to Broker: ");
        Serial.print(MQTT_BROKER);
        Serial.print(" on Port: ");
        Serial.print(MQTT_PORT);
        Serial.print("...");
        
        // Attempt to connect
        if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
            Serial.println(" SUCCESS");
            
            // Subscribe to control topics
            mqttClient.subscribe(TOPIC_SUB_LIGHT_CTRL);
            mqttClient.subscribe(TOPIC_SUB_DOOR_CTRL);
            Serial.println("[MQTT] Subscribed to Control Topics successfully.");
        } else {
            Serial.print(" FAILED, State code: ");
            Serial.print(mqttClient.state());
            Serial.println(" -> Retrying in 5 seconds...");
            vTaskDelay(pdMS_TO_TICKS(5000));
            return; // Don't block the loop completely
        }
    }
}

void wifi_mqtt_task(void *pvParameters) {
    Serial.println("[SYSTEM] WiFi & MQTT Task Initializing...");
    globalCtx = (AppContext*)pvParameters;
    
    setupWiFi();
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);

    unsigned long lastPublishTime = 0;
    const unsigned long PUBLISH_INTERVAL = 5000; // Publish every 5 seconds
    unsigned long lastWifiAttempt = 0;

    while (1) {
        unsigned long currentMillis = millis();

        // Handle WiFi connection non-blocking
        if (WiFi.status() != WL_CONNECTED) {
            if (currentMillis - lastWifiAttempt > 5000) {
                Serial.println("[WIFI] WARNING: Connection lost! Attempting to reconnect...");
                WiFi.disconnect();
                WiFi.reconnect();
                lastWifiAttempt = currentMillis;
            }
        } else {
            // Handle MQTT only if WiFi is connected
            if (!mqttClient.connected()) {
                reconnectMQTT();
            } else {
                mqttClient.loop();
            }
        }

        // Handle immediate intrusion alerts
        bool alertTriggered = false;
        xSemaphoreTake(globalCtx->mutex, portMAX_DELAY);
        alertTriggered = globalCtx->intrusionDetected;
        xSemaphoreGive(globalCtx->mutex);

        if (alertTriggered) {
            if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
                mqttClient.publish(TOPIC_PUB_ALERT, "Alert! Unauthorized Entry");
                Serial.println("[MQTT] Published Intrusion Alert!");
                xSemaphoreTake(globalCtx->mutex, portMAX_DELAY);
                globalCtx->intrusionDetected = false;
                xSemaphoreGive(globalCtx->mutex);
            }
        }

        // Publish sensor data AND print to Serial monitor periodically
        // even if WiFi or MQTT are disconnected, so logging continues locally.
        if (currentMillis - lastPublishTime >= PUBLISH_INTERVAL) {
            float t_temp, t_humi;
            int t_light;
            DoorState t_door;
            
            // Read shared data safely
            xSemaphoreTake(globalCtx->mutex, portMAX_DELAY);
            t_temp = globalCtx->currentTemp;
            t_humi = globalCtx->currentHumi;
            t_light = globalCtx->currentLightLevel;
            t_door = globalCtx->currentDoorState;
            xSemaphoreGive(globalCtx->mutex);

            // Always log sensor data locally
            Serial.println("--- [TELEMETRY] Sensor Status Summary ---");
            Serial.print("  -> Temp: "); Serial.println(t_temp);
            Serial.print("  -> Humi: "); Serial.println(t_humi);
            Serial.print("  -> Light: "); Serial.println(t_light);
            Serial.print("  -> Door: "); Serial.println(t_door == DOOR_LOCKED ? "LOCKED" : "UNLOCKED");
            
            // Attempt to publish over MQTT if completely connected
            if (WiFi.status() == WL_CONNECTED && mqttClient.connected()) {
                char msgBuffer[20];
                
                sprintf(msgBuffer, "%.2f", t_temp);
                mqttClient.publish(TOPIC_PUB_TEMP, msgBuffer);
                
                sprintf(msgBuffer, "%.2f", t_humi);
                mqttClient.publish(TOPIC_PUB_HUMI, msgBuffer);
                
                sprintf(msgBuffer, "%d", t_light);
                mqttClient.publish(TOPIC_PUB_LIGHT, msgBuffer);
                
                if (t_door == DOOR_LOCKED) {
                    mqttClient.publish(TOPIC_PUB_DOOR, "LOCKED");
                } else {
                    mqttClient.publish(TOPIC_PUB_DOOR, "UNLOCKED");
                }
                Serial.println("  -> [MQTT] Published successfully to Broker.");
            } else {
                Serial.println("  -> [MQTT] Not connected. Pending local data...");
            }
            Serial.println("-----------------------------------------");
            
            lastPublishTime = currentMillis;
        }

        vTaskDelay(pdMS_TO_TICKS(10)); // Yield to other tasks
    }
}
