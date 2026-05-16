# SimpleHome: A Modern End-to-End IoT Infrastructure

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-v20-blue.svg)](https://nodejs.org/)
[![Next.js Version](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

SimpleHome is a comprehensive, production-ready IoT ecosystem designed to bridge the gap between embedded hardware (ESP32) and modern web technologies. This project showcases a full-stack implementation featuring real-time telemetry, remote device control, secure user authentication, and a robust self-hosted server infrastructure.

---

## 📖 Table of Contents

- [1. Overview](#1-overview)
- [2. Key Features](#2-key-features)
- [3. System Architecture](#3-system-architecture)
  - [3.1 Hardware Layer (Data Acquisition)](#31-hardware-layer-data-acquisition)
  - [3.2 Communication Layer (MQTT)](#32-communication-layer-mqtt)
  - [3.3 Backend Layer (Logic & Integration)](#33-backend-layer-logic--integration)
  - [3.4 Storage Layer (Data Persistence)](#34-storage-layer-data-persistence)
  - [3.5 Frontend Layer (User Experience)](#35-frontend-layer-user-experience)
- [4. Technical Stack Detail](#4-technical-stack-detail)
- [5. Server Infrastructure & Security](#5-server-infrastructure--security)
  - [5.1 Hardware Specifications](#51-hardware-specifications)
  - [5.2 Software Environment](#52-software-environment)
  - [5.3 Security Implementation (The "Onion" Model)](#53-security-implementation-the-onion-model)
- [6. Database Design](#6-database-design)
- [7. MQTT Protocol Details](#7-mqtt-protocol-details)
- [8. API Documentation](#8-api-documentation)
- [9. Installation & Deployment](#9-installation--deployment)
  - [9.1 Prerequisites](#91-prerequisites)
  - [9.2 Step-by-Step Setup](#92-step-by-step-setup)
- [10. Maintenance & Backups](#10-maintenance--backups)
- [11. Troubleshooting & FAQ](#11-troubleshooting--faq)
- [12. Result Showcase](#12-result-showcase)
- [13. Future Roadmap](#13-future-roadmap)
- [14. Contributing](#14-contributing)
- [15. License & Legal](#15-license--legal)
- [16. Acknowledgments](#16-acknowledgments)

---

## 1. Overview

With the proliferation of affordable embedded devices like the ESP32 (Yolo:Bit), the need for an integrated platform to collect, store, visualize, and act upon sensor data has become essential. **SimpleHome** is designed as a modular, scalable prototype that leverages the **Publish/Subscribe** model of MQTT for efficiency and the **REST API** model for web accessibility.

Whether you are monitoring ambient temperature/humidity or remotely unlocking a security door, SimpleHome provides a unified interface that works across local and public networks securely. This project was developed as part of the Interdisciplinary Project at HCMUT, focusing on the intersection of Software Engineering, Embedded Systems, and DevOps.

---

## 2. Key Features

- **Real-time Telemetry**: Instant visualization of sensor data (Temperature, Humidity, Light intensity).
- **Bidirectional Control**: Remote hardware control (Lighting modes, Ventilation fan speed, Security door state).
- **State Persistence**: All device states are persisted in PostgreSQL, ensuring that the dashboard reflects reality even after a server restart.
- **Multi-User Authentication**: Secure JWT-based login system with role-based access control (Admin/User).
- **Security Hardening**: Integrated Authelia SSO, Headscale VPN, and CrowdSec intrusion prevention.
- **Dynamic UI**: Next.js 14 dashboard with Dark/Light/System theme support and smooth CSS transitions.
- **Deployment & Scaling**: Fully containerized using Docker Compose, allowing for rapid deployment on any Linux server.
- **Automated Maintenance**: Built-in scripts for Restic incremental backups and Docker lifecycle management.

---

## 3. System Architecture

The system is designed with a layered approach to ensure separation of concerns, high maintainability, and horizontal scalability. By decoupling the data acquisition from the data presentation, we ensure that the system remains responsive even under heavy telemetry load.

### 3.1 Hardware Layer (Data Acquisition)
The hardware layer is the "sensory system" of SimpleHome. It consists of physical components that interact with the environment.
- **Core Processing:** The **Yolo:Bit** board, powered by the ESP32 microcontroller, provides the necessary compute and Wi-Fi connectivity. It runs a custom firmware that manages sensor polling and asynchronous MQTT messaging.
- **Sensors:** 
    - **DHT20:** High-precision digital temperature and humidity sensor (I2C).
    - **Light Sensor:** Integrated phototransistor for ambient light intensity monitoring.
    - **IR Motion Sensor:** Passive Infrared sensor for security monitoring and occupant detection.
- **Actuators:**
    - **Servo Motors:** Used for simulating electronic door locks with 180-degree rotation.
    - **LED Arrays:** Used for room lighting simulation (Auto/Manual modes).
    - **PWM Fans:** DC motors controlled via Pulse Width Modulation (0-100% speed control).

### 3.2 Communication Layer (MQTT)
The **Eclipse Mosquitto** broker serves as the backbone for all internal and external device communication.
- **Protocol:** MQTT v3.1.1 is used for its low power consumption and small packet size, making it ideal for IoT.
- **Broker Configuration:** Hosted in a Docker container (`mosquitto_public`), it is configured to allow internal connections from the backend and external connections from hardware devices via port 1883.
- **Topic Hierarchy:** Designed for scalability (e.g., `simplehome/sensor/{id}/{type}`).
- **Quality of Service (QoS):** The system primarily uses QoS 0 for telemetry and QoS 1 for critical control commands.

### 3.3 Backend Layer (Logic & Integration)
The backend is a robust **Node.js** application written in **TypeScript**. It acts as the "brain" of the operation.
- **MQTT Bridge:** The backend maintains a persistent connection to the Mosquitto broker. It listens for sensor data and automatically parses incoming messages to store them in the database.
- **RESTful API:** Developed using **Express.js**, it provides structured endpoints for the frontend to query historical data, authenticate users, and send downstream commands to devices.
- **Security Logic:** Handles JWT generation and validation, ensuring that only authorized users can access the dashboard or control devices.

### 3.4 Storage Layer (Data Persistence)
**PostgreSQL 16** is the chosen database engine for its reliability and support for complex relational queries.
- **Schema Management:** The database uses a strictly typed schema with foreign key constraints.
- **Audit Trails:** Every command sent to a device is logged in the `control_logs` table, providing a complete history.
- **Performance:** Optimized indices on timestamp columns for fast telemetry retrieval.

### 3.5 Frontend Layer (User Experience)
The user interface is built with **Next.js 14**, utilizing the modern **App Router** architecture.
- **Responsive Design:** Using **Tailwind CSS**, the dashboard works seamlessly on desktops and smartphones.
- **State Management:** Uses React Hooks and SWR for efficient data fetching and real-time UI updates.
- **Aesthetics:** Implements a sleek design with Glassmorphism, smooth transitions, and a dynamic theme toggle.

---

## 4. Technical Stack Detail

### Backend Stack
- **Runtime:** Node.js 20 LTS.
- **Framework:** Express.js with TypeScript.
- **MQTT Client:** `mqtt` library for high-performance messaging.
- **Database Driver:** `pg` (node-postgres) with connection pooling.
- **Auth:** `jsonwebtoken` for stateless sessions.

### Frontend Stack
- **Framework:** Next.js 14 (App Router).
- **Styling:** Tailwind CSS + Framer Motion (for animations).
- **Icons:** Lucide React.
- **Charts:** Recharts for historical telemetry visualization.

---

## 5. Server Infrastructure & Security

Our deployment strategy focuses on **Self-Hosting**, giving users absolute control over their privacy.

### 5.1 Hardware Specifications
- **CPU:** AMD A6-6400K (Dual-Core @ 3.9GHz).
- **RAM:** 10GB DDR3 1600MHz.
- **Storage:** 120GB SATA SSD.
- **Networking:** Dual 1Gbps NICs (configured in **Bonding** mode for redundancy).

### 5.2 Software Environment
- **OS:** Ubuntu Server 24.04 LTS (Headless).
- **Orchestration:** Docker Engine + Docker Compose.
- **Network Management:** Nginx Proxy Manager (NPM) for SSL/Reverse Proxy.
- **Domain:** Managed via Dynu DDNS at `hungthinhcloud.freeddns.org`.

### 5.3 Security Implementation (The "Onion" Model)
1.  **Network Level:** Strict NAT and port forwarding on the home router.
2.  **OS Level:** UFW (Uncomplicated Firewall) blocks all but essential ports.
3.  **Authentication Level:** **Authelia** provides a Single Sign-On (SSO) portal with 2FA support.
4.  **Access Level:** **Headscale (VPN)** ensures secure remote access without exposing SSH publicly.
5.  **Intrusion Prevention:** **CrowdSec** monitors logs and blocks malicious IPs in real-time.

---

## 6. Database Design

### 6.1 Schema Overview
- **`users`**: `id, username, password_hash, role, created_at`
- **`devices`**: `device_id, name, type, status, last_seen`
- **`telemetry_logs`**: `id, device_id, sensor_type, value, timestamp`
- **`control_logs`**: `id, user_id, device_id, action, value, timestamp`

### 6.2 Sample Query (Telemetry History)
```sql
SELECT value, timestamp 
FROM telemetry_logs 
WHERE device_id = 'yolobit-01' 
AND sensor_type = 'temp' 
ORDER BY timestamp DESC 
LIMIT 100;
```

---

## 7. MQTT Protocol Details

### Topic Structure
- **Telemetry:** `simplehome/sensor/{device_id}/{sensor_type}`
- **Control:** `simplehome/control/{device_id}/{action}`
- **Availability:** `simplehome/status/{device_id}` (LWT - Last Will and Testament)

### Example Payloads
- **Temperature:** `25.5` (Plain string) or `{"v": 25.5, "u": "C"}` (JSON).
- **Light:** `850` (Raw ADC value).
- **Control:** `ON`, `OFF`, or `AUTO`.

---

## 8. API Documentation

### Auth Endpoints
- `POST /api/auth/login`: `{username, password}` -> `{token, user}`
- `GET /api/auth/me`: Validates token.

### Data Endpoints
- `GET /api/devices`: List all devices.
- `GET /api/telemetry/latest`: Most recent readings.
- `GET /api/telemetry/history/:id/:type`: Time-series data for charts.

### Control Endpoints
- `POST /api/control`: `{deviceId, action, value}`.

---

## 9. Installation & Deployment

### 9.1 Prerequisites
- Linux Server (Ubuntu recommended).
- Docker & Docker Compose.
- Git.

### 9.2 Step-by-Step Setup
1.  **Clone Repo:** `git clone https://github.com/1172005thinh/SimpleHome.git`
2.  **Env Config:** Create `.env` files based on `.env.example`.
3.  **DB Init:** The database will auto-initialize from `database/init.sql`.
4.  **Launch:** `docker compose up -d --build`.
5.  **Proxy:** Configure Nginx Proxy Manager to point your domain to `localhost:3000`.

---

## 10. Maintenance & Backups

### 10.1 Backup Strategy
We use **Restic** for automated, encrypted backups of the `/opt/docker` directory.
- **Frequency:** Daily (Incremental).
- **Retention:** Keep last 7 dailies, 4 weeklies, and 12 monthlies.

### 10.2 Script Usage
```bash
# Manual backup
./backup.sh run

# View backup stats
restic -r /path/to/repo stats
```

---

## 11. Troubleshooting & FAQ

### Q: Why is the MQTT broker not receiving data?
**A:** Check if port 1883 is open in UFW and if the ESP32 is using the correct IP/Domain.

### Q: How do I reset the admin password?
**A:** Use `docker exec -it simplehome_db psql` to update the `users` table directly.

### Q: Can I run this on a Raspberry Pi?
**A:** Yes, the entire stack is ARM-compatible. Just ensure you use the `alpine` variants of images.

---

## 12. Result Showcase

- **Dashboard:** Features real-time cards with interactive switches.
- **Monitoring:** Live charts powered by Recharts.
- **Hardware:** Yolo:Bit connected via I2C to various sensors.

---

## 13. Future Roadmap

- [ ] **Mobile App:** React Native application for iOS/Android.
- [ ] **Voice Control:** Integration with Alexa and Google Home.
- [ ] **Security:** Implement TLS for MQTT (Port 8883).
- [ ] **Persistence:** Add InfluxDB for more efficient time-series storage.

---

## 14. Contributing

We welcome contributions! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch.
3.  Submit a Pull Request with a detailed description of your changes.
4.  Ensure all code follows our ESLint configuration.

---

## 15. License & Legal

This project is licensed under the **MIT License**.
Copyright (c) 2026 SimpleHome Team.

---

## 16. Acknowledgments

- **Supervisor:** Phan Văn Sỹ (HCMUT).
- **Authors:** Lê Hoàng Tân & Nguyễn Hưng Thịnh.

---
*(End of Documentation - v1.0.0)*

---
### Appendix: Detailed Component Breakdown

#### 1. Eclipse Mosquitto (The Messenger)
Mosquitto is a lightweight MQTT broker that handles all the message passing in our system. It is responsible for:
- Routing telemetry data from ESP32 to our Node.js backend.
- Routing control commands from the backend back to the ESP32.
- Handling "Last Will and Testament" (LWT) messages to detect when a device goes offline unexpectedly.

#### 2. Node.js Backend (The Bridge)
Our backend acts as a translator. It speaks both MQTT and HTTP. 
- It maintains a long-lived MQTT connection to the broker.
- When it hears a "sensor" message, it immediately writes it to PostgreSQL.
- It provides a RESTful API for our web frontend to fetch that data later.

#### 3. PostgreSQL (The Memory)
We chose PostgreSQL because of its extreme reliability. It stores:
- **Users:** Who can access the system.
- **Devices:** What hardware is part of our home.
- **Telemetry:** The history of every sensor reading.
- **Audit Logs:** A record of every light turned on and every door unlocked.

#### 4. Next.js Frontend (The Interface)
The frontend is what the user actually sees.
- It uses React to build a dynamic, interactive dashboard.
- It fetches data from the backend using standard HTTP requests.
- It provides a beautiful user experience with support for dark mode and mobile-friendly layouts.

#### 5. Nginx Proxy Manager (The Gatekeeper)
NPM handles all the incoming traffic from the internet.
- It provides SSL certificates via Let's Encrypt so your connection is always encrypted.
- It acts as a reverse proxy, directing traffic to either the frontend or the backend API based on the subdomain.

#### 6. Authelia (The Bouncer)
Authelia provides an extra layer of security. Before you can even see the login screen of SimpleHome, you must pass through Authelia's portal. This allows for:
- Two-Factor Authentication (2FA).
- Single Sign-On across multiple services.
- Protection against brute-force attacks.

#### 7. Restic (The Insurance)
Restic ensures that even if our server's SSD fails, we don't lose any data.
- It takes incremental snapshots of our Docker directory.
- It encrypts all backup data before it leaves the server.
- It can store backups on local disks, SFTP servers, or cloud storage like AWS S3.

---

### Hardware Wiring Guide (Conceptual)

| Component | Pin (Yolo:Bit) | Protocol |
| :--- | :--- | :--- |
| **DHT20** | I2C (SCL/SDA) | I2C |
| **Servo (Door)** | P0 | PWM |
| **LED (Light)** | P1 | Digital |
| **Fan (Motor)** | P2 | PWM |
| **PIR Sensor** | P8 | Digital |

---

### Troubleshooting Deep Dive

#### Connectivity Issues
If your ESP32 is struggling to connect:
1.  **Check Signal Strength:** ESP32 antennas are small. Ensure it's close to the router.
2.  **Verify IP Address:** If using a local IP, ensure the server hasn't changed IPs (use a static lease).
3.  **Check MQTT Port:** Ensure port 1883 is open on the server firewall.

#### Database Performance
If the dashboard feels slow:
1.  **Check Indices:** Ensure you have indices on the `timestamp` and `device_id` columns.
2.  **Vacuum Database:** Periodically run `VACUUM ANALYZE` if you are logging thousands of points per minute.
3.  **Check Resource Usage:** Use `htop` to see if PostgreSQL is consuming too much CPU.

#### SSL/HTTPS Errors
If your browser says the connection is "Not Secure":
1.  **Check Let's Encrypt Logs:** In Nginx Proxy Manager, check the logs for certificate renewal failures.
2.  **Check Port 80:** Port 80 must be open to the internet for the HTTP-01 challenge to work.
3.  **Verify Domain DNS:** Ensure your domain's A record points correctly to your WAN IP.

---

### Contribution Guidelines (Expanded)

We are committed to building a clean, modern codebase. When contributing:
- **Code Style:** We use Prettier and ESLint. Please run `npm run lint` before submitting.
- **Commit Messages:** Use conventional commits (e.g., `feat: add fan speed control`, `fix: resolve auth timeout`).
- **Testing:** If you add a new feature, please add a corresponding test case (if applicable).
- **Documentation:** Update this README if you change any environment variables or API endpoints.

---

### Project Roadmap Detailed

#### Short Term (0-3 Months)
- Implement `bcrypt` for secure password storage.
- Add support for OTA (Over-The-Air) firmware updates for the ESP32.
- Refine the mobile responsive layout for the dashboard.

#### Medium Term (3-9 Months)
- Integrate Prometheus for system-level monitoring (CPU, RAM, Disk).
- Add support for Zigbee devices via a Zigbee2MQTT bridge.
- Implement a "Scene" engine (e.g., "Movie Night" turns off lights and locks doors).

#### Long Term (1 Year+)
- Develop a native Flutter or React Native mobile app.
- Add support for AI-driven anomaly detection (e.g., "Unusual activity detected in the kitchen").
- Explore decentralized architecture for multi-home management.

---

### Final Words

SimpleHome is more than just a project; it's a testament to the power of open-source software and self-hosting. We hope this project inspires you to build your own smart home, one container at a time.

---
**SimpleHome Team**
*Building a smarter, more secure future.*
