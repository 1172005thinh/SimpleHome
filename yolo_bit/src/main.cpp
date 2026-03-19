#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include "DHT20.h"

// --- Pin Definitions ---
// Adjust these pins according to your actual hardware wiring
#define LIGHT_SENSOR_PIN    34 // Analog pin for the light sensor
#define LED_PIN             15 // Digital pin for the 4-LED NeoPixel module
#define NUM_LEDS            4

// --- Configuration ---
#define LIGHT_THRESHOLD     2000 // Analog threshold to differentiate day/night

// --- Global Objects ---
Adafruit_NeoPixel pixels(NUM_LEDS, LED_PIN, NEO_GRB + NEO_KHZ800);
DHT20 dht20;

unsigned long lastDHTReadTime = 0;
const unsigned long DHT_INTERVAL = 5000; // Read every 5 seconds

void setup() {
  Serial.begin(115200);
  
  // 1. Initialize NeoPixel LEDs
  pixels.begin();
  pixels.clear();
  pixels.show(); // Turn off initially

  // 2. Initialize DHT20 Sensor (I2C)
  Wire.begin(); // Standard I2C: SDA=21, SCL=22
  if (dht20.begin()) {
    Serial.println("DHT20 Initialized successfully");
  } else {
    Serial.println("DHT20 Initialization failed!");
  }
}

void loop() {
  unsigned long currentMillis = millis();

  // --- Feature 1: Day/Night Power Saving Mode (Automatic) ---
  int lightLevel = analogRead(LIGHT_SENSOR_PIN);
  
  // NOTE: Depending on your LDR config, you may need to flip the logic.
  // Assuming lower analog value = darker.
  if (lightLevel < LIGHT_THRESHOLD) {
    // It's dark -> Turn on LEDs
    for(int i = 0; i < NUM_LEDS; i++) {
        pixels.setPixelColor(i, pixels.Color(255, 255, 255)); // White light
    }
  } else {
    // It's bright -> Turn off LEDs
    for(int i = 0; i < NUM_LEDS; i++) {
        pixels.setPixelColor(i, pixels.Color(0, 0, 0)); // Off
    }
  }
  pixels.show();

  // --- Feature 2: Temp & Humidity Monitoring to Serial Monitor ---
  if (currentMillis - lastDHTReadTime >= DHT_INTERVAL) {
    dht20.read();
    
    float temperature = dht20.getTemperature();
    float humidity = dht20.getHumidity();

    Serial.print("Light Level: ");
    Serial.print(lightLevel);
    Serial.print("\t | Temperature: ");
    Serial.print(temperature);
    Serial.print(" °C\t | Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");

    lastDHTReadTime = currentMillis;
  }
  
  delay(100); // Simple debounce/throttle
}