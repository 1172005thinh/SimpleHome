#include "lcd_module.h"
#include "config.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// I2C address 0x21, 16 Columns, 2 Rows
LiquidCrystal_I2C lcd(I2C_LCD_ADDR, 16, 2);

void lcd_task(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;
    
    // Explicitly initialize the wire bus with our custom pins just in case
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    
    lcd.init();
    lcd.backlight();
    
    // Startup message
    lcd.setCursor(0, 0);
    lcd.print("Welcome!");
    
    // Freeze welcome screen for 2 seconds
    vTaskDelay(pdMS_TO_TICKS(2000));
    
    // Buffer strictly sized for 16-column + null terminator
    char buffer1[17];
    char buffer2[17];

    while(1) {
        float t_temp, t_humi;
        int t_light;
        DoorState t_door;
        
        // Fetch safe snapshot
        xSemaphoreTake(ctx->mutex, portMAX_DELAY);
        t_temp = ctx->currentTemp;
        t_humi = ctx->currentHumi;
        t_light = ctx->currentLightLevel;
        t_door = ctx->currentDoorState;
        xSemaphoreGive(ctx->mutex);
        
        // Line 1: Temperature + Humidity
        snprintf(buffer1, sizeof(buffer1), "T:%4.1fC H:%4.1f", t_temp, t_humi);
        
        // Line 2: Light intensity + Door status
        snprintf(buffer2, sizeof(buffer2), "L:%-4d D:%-4s", t_light, (t_door == DOOR_LOCKED) ? "LOCK" : "UNLK");
        
        // Overwrite fixed-width lines instead of lcd.clear() to reduce flickering
        lcd.setCursor(0, 0);
        lcd.print("                ");
        lcd.setCursor(0, 0);
        lcd.print(buffer1);
        
        lcd.setCursor(0, 1);
        lcd.print("                ");
        lcd.setCursor(0, 1);
        lcd.print(buffer2);
        
        vTaskDelay(pdMS_TO_TICKS(1000)); // Refresh 1 time per second
    }
}
