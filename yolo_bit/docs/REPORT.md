# REPORT

## Last prompt report goes here

**Date:** March 19, 2026
**Role:** Senior Hardware Engineer
**Task Executed:** 
1. Day/Night power saving mode (automatic mode based on the light sensor).
2. Exported temperature and humidity values to the SerialMonitor for monitoring.

**Details:**
- Modified `src/main.cpp` exclusively to incorporate both modules.
- Defined NeoPixel digital pin as `15`, Analog Light Sensor pin as `34` for automatic night light illumination based on an analog threshold (`2000`).
- Configured DHT20 to transmit internal states via standard I2C (`SDA=21`, `SCL=22`).
- Integrated a `5000` ms interval logging mechanism in the main `loop()` to print `Light Value`, `Temperature`, and `Humidity` effectively to the SerialMonitor (`115200` baud rate).
- No web interface logic was set; the system performs independently. Tested logic compilation layout.
