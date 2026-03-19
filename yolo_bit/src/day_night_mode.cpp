#include "day_night_mode.h"
#include "config.h"
#include <Adafruit_NeoPixel.h>

Adafruit_NeoPixel pixels(NUM_LEDS, PIN_LED_NEOPIXEL, NEO_GRB + NEO_KHZ800);

void day_night_task(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;
    
    pixels.begin();
    pixels.clear();
    pixels.show();
    
    pinMode(PIN_LIGHT_SENSOR, INPUT);

    while(1) {
        int lightLevel = analogRead(PIN_LIGHT_SENSOR);
        
        // Auto logic: Dark = LEDs ON, Bright = LEDs OFF
        if (lightLevel < LIGHT_THRESHOLD) {
            for(int i = 0; i < NUM_LEDS; i++) {
                pixels.setPixelColor(i, pixels.Color(255, 255, 255));
            }
            xSemaphoreGive(ctx->semDark);
        } else {
            for(int i = 0; i < NUM_LEDS; i++) {
                pixels.setPixelColor(i, pixels.Color(0, 0, 0));
            }
            xSemaphoreGive(ctx->semBright);
        }
        pixels.show();
        
        vTaskDelay(pdMS_TO_TICKS(1000)); // Check every second
    }
}
