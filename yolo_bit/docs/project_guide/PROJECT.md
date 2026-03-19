# IOT KIT

This document is an overview of the Iot Kit project called "SimpleHome". It includes the project description, features, and instructions for setting up and using the kit.

## Project Description

SimpleHome is an IoT kit designed by a group of HCMUT students for smart home applications. The kit includes an MCU called "Yolo Bit" provided by OhStem Education, which is based on the ESP32 microcontroller.

## Hardware Components

The Kit includes the following hardware components:

1. Yolo Bit MCU (ESP32 WROVER B)
2. A extended board with various I2C ports and analog pins, etc.
3. A 4 led module
4. A light sensor module
5. A temperature and humidity sensor module (DHT20)
6. A relay module
7. A 1602 LCD module
8. An IR module

## Features

Our group has decided to implement the following features for our project:

1. **Day/Night power saving mode**
2. **Temperature and humidity monitoring**
3. **Secured door monitoring**
4. **Remote control/monitor via web interface (dashboard)**

### Day/Night Power Saving Mode

This feature allows the system to automatically turn on/off lights based on the ambient light level detected by the light sensor, or manually through the web interface.

- Controller:
  - Light sensor module (light/dark)
  - Web interface (On/Off toggle, Auto/Off/Manual switch)
- Actuator:
  - 4 led module (high/low)
- Logic:
  - If the switch Auto/Off/Manual (on the dashboard) is set to Auto:
    - If the light sensor detects darkness for a certain period, the system will turn on the lights. Users can also manually turn on the lights through the web interface, but doing will switch the system to Manual mode automatically.
    - If the light sensor detects brightness for a certain period, the system will turn off the lights. Users can also manually turn off the lights through the web interface, but doing will switch the system to Manual mode automatically.
  - If the switch Auto/Off/Manual is set to Manual:
    - The user can manually turn on/off the lights through the web interface. The light stays in the last state until the user changes it or the system is set back to Auto mode.
  - If the switch Auto/Off/Manual is set to Off:
    - The system will turn off the lights and ignore the light sensor readings. The system will stay in this state until the user changes it to Auto or Manual mode via the switch on the dashboard.

### Temperature and Humidity Monitoring

This feature allows users to monitor the temperature and humidity levels in their home through the web interface.

- Controller:
  - DHT20 sensor module (temperature and humidity)
  - Web interface (temperature and humidity display)
- Actuator:
  - Web interface (display and notification)
- Logic:
  - Always read the temperature and humidity data from the DHT20 sensor and display it on the web interface each 5s.
  - If the (24, 60) <= (temp, humid) <= (28, 100):
    - Notify: "It might rain today, remember to take an umbrella and close the windows if you are going out."
  - If the (temp, humid) >= (28, 50):
    - Notify: "It is quite hot today, remember to stay hydrated and turn on the fan or AC if you are at home."
  - If the (temp, humid) <= (24, 50):
    - Notify: "It is quite cold today, remember to wear warm clothes and turn on the heater if you are at home."

### Secured Door Monitoring

This feature allows users to remotely control the dock lock and monitor its status through the web interface.

- Controller:
  - Relay module (door lock)
  - Web interface (lock/unlock toggle, status display)
  - IR module (optional, for breaking in detection)
- Actuator:
  - Relay module (lock/unlock - lock the door when the relay is on, unlock the door when the relay is off)
  - Web interface (display and notification)
- Logic:
  - Always read the status of the door lock (locked/unlocked) and display it on the web interface each 1s.
  - If the toggle Unlock/Lock is set to Lock:
    - The system will lock the door and update the status on the web interface. The system will stay in this state for until the user changes it to Unlock mode via the toggle on the dashboard.
  - If the toggle Unlock/Lock is set to Unlock:
    - The system will unlock the door and update the status on the web interface. The system will stay in this state until the user changes it to Lock mode via the toggle on the dashboard. (Optional, there is a setting on the dashboard to automatically lock the door after a certain period of time, e.g., 30s, if there is no change in the door status.)
  - (Optional) If the IR module detects an unauthorized entry (e.g., door is locked but the IR sensor detects door opening):
    - Notify: "Alert! Unauthorized entry detected. Please check your door immediately."
  - (Optional) If the IR module detects a normal entry (e.g., door is unlocked and the door movement is detected):
    - Notify: "Door is opened by someone."
  
### Remote Control/Monitor via Web Interface (Dashboard)

This feature allows users to remotely control and monitor their smart home system through a web interface.

- Controller:
  - Web interface (dashboard)
- Actuator:
  - Web interface (control and display)
  - All other components (light sensor, DHT20 sensor, relay module)
- Logic:
  - The MCU connects to the Wifi network and continually updates the devices status on MQTT broker. The host server subscribes to the MQTT topics and updates the dashboard accordingly. The user can access the dashboard through a web browser via <host_server_ip>:<port> (or better a DNS name) and control the devices through the dashboard. The dashboard also displays the status of the devices and any notifications based on the logic defined in the previous features.
