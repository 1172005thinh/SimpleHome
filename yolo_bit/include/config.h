#ifndef CONFIG_H
#define CONFIG_H

// --- Hardware Pins Mapping (Yolo:Bit / ESP32 WROVER B) ---
// Based on typical OhStem Yolo:Bit edge connector mapping to ESP32:
#define PIN_LIGHT_SENSOR    32 // P0
#define PIN_IR_SENSOR       33 // P1
#define PIN_RELAY           25 // P2
#define PIN_LED_NEOPIXEL    16 // P16 (Dual channel P16, P12)
#define NUM_LEDS            4

#define I2C_SCL_PIN         22 // P19
#define I2C_SDA_PIN         21 // P20

#define I2C_LCD_ADDR        0x21

// --- Thresholds ---
#define LIGHT_THRESHOLD     2000

// --- Task Settings ---
#define STACK_SIZE_SENSOR   2048
#define STACK_SIZE_MAIN     4096
#define STACK_SIZE_MQTT     4096
#define STACK_SIZE_LCD      2048

// --- Network & MQTT Settings ---
#define WIFI_SSID           "701H6-KH&KTMT"
#define WIFI_PASSWORD       "svkhktmt"

#define MQTT_BROKER         "hungthinhcloud.freeddns.org" // Personal private server
#define MQTT_PORT           1883
#define MQTT_CLIENT_ID      "SimpleHome_YoloBit_Client"
#define MQTT_USER           ""
#define MQTT_PASSWORD       ""

// --- MQTT Topics ---
#define TOPIC_PUB_LIGHT     "simplehome/sensor/light"
#define TOPIC_PUB_TEMP      "simplehome/sensor/temperature"
#define TOPIC_PUB_HUMI      "simplehome/sensor/humidity"
#define TOPIC_PUB_DOOR      "simplehome/sensor/door_status"
#define TOPIC_PUB_ALERT     "simplehome/sensor/alert"

#define TOPIC_SUB_LIGHT_CTRL "simplehome/control/light" // Payload: "AUTO", "ON", "OFF"
#define TOPIC_SUB_DOOR_CTRL  "simplehome/control/door"  // Payload: "LOCK", "UNLOCK"

#endif // CONFIG_H
