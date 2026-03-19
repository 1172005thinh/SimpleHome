#ifndef CONFIG_H
#define CONFIG_H

// --- Hardware Pins ---
#define PIN_LIGHT_SENSOR    34 // IO single channel port P0 (example mapping)
#define PIN_LED_NEOPIXEL    15 // Extended board pin
#define NUM_LEDS            4

#define PIN_RELAY           4  // IO single port P2 (example mapping)
#define PIN_IR_SENSOR       5  // IO single port P1 (example mapping)

// --- Thresholds ---
#define LIGHT_THRESHOLD     2000

// --- Task Settings ---
#define STACK_SIZE_SENSOR   2048
#define STACK_SIZE_MAIN     4096

#endif // CONFIG_H
