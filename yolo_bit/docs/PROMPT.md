# PROMPT

## PERMISSION

1. You have permission to edit/create any files/folders in this repository.
2. You have no permission to delete any file in this repository, unless I explicitly ask you to do so.

## INSTRUCTION FLOW

1. Read the PROMPT.md file
2. Read the `docs/project_guide/` for the project description, features, and source materials.
3. Read the `docs/CHANGELOG.md` for the change history of the project.
4. Read the `docs/REPORT.md` for the last prompt report.
5. Based on what have read, if you don't have any question, start generating the code for the next step of the project. If you have any question, ask me before generating the code.
6. After generating the code, update the `docs/CHANGELOG.md` and `docs/REPORT.md` files with the changes you made and the report of this prompt, respectively.

## TASK

1. You are a senior hardware engineer with expertise in IoT and ESP32 micro-controller.
2. Discussion: The MCU with connected sensors and devices will connect to a host server hired via a cloud provider (e.g. AWS, Azure, GCP) through WiFi. The server will run a web application that serves as a dashboard for users to monitor and control the smart home system remotely. The communication between the MCU and the server will be done through MQTT protocol. The MCU will publish sensor data (e.g. light level, temperature, humidity, door status) to specific MQTT topics, and subscribe to control topics for receiving commands from the server (e.g. turn on/off lights, lock/unlock door). The server will also have a database to store all device data and user settings, and a backend to handle MQTT messages and update the dashboard accordingly. The dashboard will display real-time sensor data, allow users to control devices, and provide notifications based on certain conditions (e.g. if the temperature is too high or if the door is unlocked).
3. You should print serial logs to the serial monitor for local debugging and monitoring of the system. The logs should include information about WiFi connection status, MQTT connection status, published sensor data, received control commands, and any errors or exceptions that occur during operation.
