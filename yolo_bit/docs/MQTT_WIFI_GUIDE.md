# Smart Home MQTT Communication Guide

This document outlines the Wi-Fi and MQTT architecture running natively on the SimpleHome ESP32 MCU module. This guide is tailored for backend developers, web dashboard engineers, and database administrators facilitating the cloud communication loop.

## Overview

The System runs an independent FreeRTOS task handling all Network Reconnection and MQTT loops seamlessly alongside physical sensors. 
- **Broker:** Set inside `include/config.h` (Defaulting to `broker.hivemq.com` over Port `1883` momentarily until a dedicated Cloud VM domain is provided).
- **Update Frequency:** The hardware publishes standard environmental data to the designated Broker on a 5-second asynchronous interval.

## MQTT Payload & Topics

All device payloads format gracefully as flat ASCII Strings ensuring lightweight payload decoding overhead.

### Sensor Data (MCU -> Server)

The ESP32 pushes these variables directly to the server:

| Physical Device | MQTT Topic | Sample Payload | Datatype | Frequency |
| --- | --- | --- | --- | --- |
| Ambient Light | `simplehome/sensor/light` | `2495` | INT | Every 5 sec |
| Temperature | `simplehome/sensor/temperature` | `25.40` | FLOAT | Every 5 sec |
| Humidity | `simplehome/sensor/humidity` | `85.20` | FLOAT | Every 5 sec |
| Door Relays | `simplehome/sensor/door_status` | `LOCKED`, `UNLOCKED` | STRING | Every 5 sec |

*Note on Intrusion detection:* To be further elaborated: Optional Intrusion overrides natively print to the Serial loop but soon port over distinct alert topics.

### Control Commands (Server -> MCU)

To instruct the ESP32 relays or alter local operation scopes, send these explicit UTF-8 strings.

| Virtual Feature | MQTT Topic | Expected Payload | Outcome |
| --- | --- | --- | --- |
| Light Switches | `simplehome/control/light` | `AUTO` | Defers control directly to light sensor variables |
| Light Switches | `simplehome/control/light` | `ON` | Ignores Light Sensors. Forces NeoPixels ON |
| Light Switches | `simplehome/control/light` | `OFF` | Ignores Light Sensors. Forces NeoPixels OFF |
| Door Relays | `simplehome/control/door` | `LOCK` | Forces generic Relay IO High |
| Door Relays | `simplehome/control/door` | `UNLOCK` | Forces generic Relay IO Low |

## Updating Network Keys

Should you spin up a dedicated application MQTT server or update the local building WiFi configurations:
1. Navigate to `/include/config.h`. 
2. Mutate `WIFI_SSID` and `WIFI_PASSWORD`.
3. Mutate `MQTT_BROKER`, `MQTT_PORT`, `MQTT_USER` & `MQTT_PASSWORD` directly. 

## Data Synchronization Note

The MCU hardware incorporates FreeRTOS Mutex abstractions. Rapid succession UI inputs will be securely pipelined without creating data collisions over outgoing states. Feel free to blast commands without delay overhead constraints on your Dashboard frontend framework.