-- 1. Users: Access control for the dashboard
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Devices: Registering your Yolo Bit
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(50) PRIMARY KEY, -- Use MAC address or unique name
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline',
    last_seen TIMESTAMP WITH TIME ZONE
);

-- 3. Telemetry Logs: Time-series sensor data
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES devices(device_id),
    sensor_type VARCHAR(30) NOT NULL, -- 'temperature', 'humidity', 'light', 'door_status', 'fan_speed', 'fan_status'
    value VARCHAR(50) NOT NULL, -- Keep as string to handle 'ON/OFF' or numbers
    unit VARCHAR(10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Control Logs: Audit trail of user actions
CREATE TABLE IF NOT EXISTS control_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    device_id VARCHAR(50) REFERENCES devices(device_id),
    action VARCHAR(50) NOT NULL, -- 'unlock_door', 'set_fan_speed', 'toggle_light'
    payload TEXT, -- Store raw command data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed an admin user (password: admin123) - hashed version later, but for now let's just use a string
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed the default device
INSERT INTO devices (device_id, name, status)
VALUES ('simplehome-yolobit-01', 'Living Room Yolo:Bit', 'offline')
ON CONFLICT (device_id) DO NOTHING;
