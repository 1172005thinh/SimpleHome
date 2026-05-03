#include "fan_control.h"
#include "config.h"

static int clamp_percent(int value) {
    if (value < 0) return 0;
    if (value > 100) return 100;
    return value;
}

static uint32_t percent_to_duty(int speedPercent) {
    const uint32_t maxDuty = (1UL << FAN_PWM_RESOLUTION) - 1;
    return (maxDuty * (uint32_t)speedPercent) / 100UL;
}

void fan_task(void *pvParameters) {
    AppContext* ctx = (AppContext*)pvParameters;

    ledcSetup(FAN_PWM_CHANNEL, FAN_PWM_FREQ, FAN_PWM_RESOLUTION);
    ledcAttachPin(PIN_FAN_PWM, FAN_PWM_CHANNEL);
    ledcWrite(FAN_PWM_CHANNEL, 0);

    bool lastEnabled = false;
    int lastAppliedSpeed = -1;

    while (1) {
        bool fanEnabled;
        int fanSpeed;

        xSemaphoreTake(ctx->mutex, portMAX_DELAY);
        fanEnabled = ctx->currentFanEnabled;
        fanSpeed = clamp_percent(ctx->currentFanSpeedPercent);
        xSemaphoreGive(ctx->mutex);

        const int appliedSpeed = fanEnabled ? fanSpeed : 0;

        if (fanEnabled != lastEnabled || appliedSpeed != lastAppliedSpeed) {
            ledcWrite(FAN_PWM_CHANNEL, percent_to_duty(appliedSpeed));
            Serial.print("[FAN] State: ");
            Serial.print(fanEnabled ? "ON" : "OFF");
            Serial.print(", Speed: ");
            Serial.print(appliedSpeed);
            Serial.println("%");

            lastEnabled = fanEnabled;
            lastAppliedSpeed = appliedSpeed;
        }

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
