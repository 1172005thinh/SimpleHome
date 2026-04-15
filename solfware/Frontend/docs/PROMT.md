# CONTEXT & ROLE
Role: You are a Senior Frontend Engineer with expertise in React, Vite, Tailwind CSS, and real-time IoT integration (MQTT).

Project: "SimpleHome" - A Smart Home IoT Dashboard.

Hardware Status: The hardware team (ESP32/RTOS) has successfully completed the firmware. The board is actively publishing sensor data and listening for control commands via an MQTT Broker.

Your Task: Build the web-based Frontend Dashboard to visualize real-time data, control actuators, and display notifications based on specific logic.

# TECH STACK
Framework: React 18+ (initialized via Vite).

Styling: Tailwind CSS.

Protocol/Library: MQTT.js (for WebSocket connection to the MQTT broker).

State Management: React Hooks (useState, useEffect, useCallback) or Context API.

# SYSTEM ARCHITECTURE & MQTT COMMUNICATION LOGIC
The dashboard must connect to the MQTT broker (e.g., broker.hivemq.com via WebSocket port, usually 8000 or 8884 for wss) and handle the following topics:

1. Data Subscription (Hardware -> Dashboard)
The dashboard needs to listen to these topics and update the UI in real-time (every 5 seconds):

simplehome/sensor/light (INT): Ambient light level.

simplehome/sensor/temperature (FLOAT): Room temperature.

simplehome/sensor/humidity (FLOAT): Room humidity.

simplehome/sensor/door_status (STRING: LOCKED, UNLOCKED): Current door lock state.

simplehome/sensor/alert (STRING): Intrusion alerts triggered by the IR sensor (e.g., "Alert! Unauthorized Entry").

2. Control Publishing (Dashboard -> Hardware)
The dashboard must provide UI controls (buttons/toggles) to publish the following UTF-8 string payloads:

Light Control (Topic: simplehome/control/light):

Payload AUTO: System uses light sensor.

Payload ON: Force lights ON.

Payload OFF: Force lights OFF.

Door Control (Topic: simplehome/control/door):

Payload LOCK: Locks the door.

Payload UNLOCK: Unlocks the door.

# FEATURE REQUIREMENTS & UI/UX LOGIC
1. Temperature and Humidity Widget
Display: Show current Temp (°C) and Humidity (%).

Logic (Notification/Toast System): The frontend must evaluate the incoming data and show alerts:

If 24 <= Temp <= 28 AND 60 <= Humid <= 100: "It might rain today, remember to take an umbrella and close the windows if you are going out."

If Temp >= 28 AND Humid >= 50: "It is quite hot today, remember to stay hydrated and turn on the fan or AC if you are at home."

If Temp <= 24 AND Humid <= 50: "It is quite cold today, remember to wear warm clothes and turn on the heater if you are at home."

2. Day/Night Power Saving Mode Widget
Display: Show current light sensor value.

Control: A 3-way toggle or 3 buttons (AUTO / MANUAL ON / MANUAL OFF).

Sync Logic: If the user clicks ON or OFF, publish ON or OFF. If the user clicks AUTO, publish AUTO.

3. Secured Door Monitoring Widget
Display: Show current door status (Locked/Unlocked) with clear visual indicators (e.g., Red/Green colors, Lock icons).

Control: A switch/button to toggle Lock/Unlock.

Intrusion Alert: If a message arrives at simplehome/sensor/alert, display a high-priority, dismissible warning modal or red toast notification: "Alert! Unauthorized entry detected. Please check your door immediately."

4. Connection Status Header
Display a persistent indicator showing the connection status to the MQTT Broker (Connected / Disconnected / Reconnecting).

INSTRUCTION FLOW FOR GENERATION
Please execute the development in the following logical steps. Wait for my confirmation after each step before writing the code for the next one.

Step 1 - Project Setup & Architecture: Outline the folder structure (/components, /hooks, /utils) and provide the necessary dependencies to install (npm install mqtt ...).

Step 2 - Custom MQTT Hook (useMqtt.js): Write a robust custom React hook to handle MQTT connection, auto-reconnection, subscribing to the 5 sensor topics, and a function to publish commands.

Step 3 - UI Components Implementation: Generate the React components using Tailwind CSS for layout (Grid/Flexbox). Provide code for:

Header.jsx (Connection status).

WeatherWidget.jsx (Temp, Humid + Logic notifications).

LightControlWidget.jsx (Light sensor & Auto/On/Off buttons).

DoorControlWidget.jsx (Door status, Lock/Unlock toggle, Alerts).

Step 4 - Main Dashboard Integration: Combine all components into App.jsx using the useMqtt hook.

If you understand the requirements and the hardware context, reply with "Understood! Ready to build the SimpleHome Dashboard. Let's start with Step 1: Project Setup & Architecture." and provide the setup details.