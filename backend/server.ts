import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './src/db';
import { initMQTT, publishCommand } from './src/mqtt';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize MQTT Subscriber
initMQTT();

// --- Auth Endpoints ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (user && user.password_hash === password) {
      res.json({
        token: 'dummy-jwt-token',
        user: { id: user.id, username: user.username, role: user.role }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// --- Device Endpoints ---
app.get('/api/devices', async (req, res) => {
  try {
    const result = await query('SELECT * FROM devices');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching devices' });
  }
});

// --- Telemetry Endpoints ---
app.get('/api/telemetry', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT ON (sensor_type) sensor_type, value, timestamp
      FROM telemetry_logs
      ORDER BY sensor_type, timestamp DESC
    `);
    
    const snapshot: any = {};
    result.rows.forEach((row: any) => {
      const type = row.sensor_type;
      const val = row.value;
      if (type === 'temperature') snapshot.temperature = parseFloat(val);
      else if (type === 'humidity') snapshot.humidity = parseFloat(val);
      else if (type === 'light') snapshot.light = parseInt(val);
      else if (type === 'door_status') snapshot.doorStatus = val;
      else if (type === 'fan_status') snapshot.fanStatus = val;
      else if (type === 'fan_speed') snapshot.fanSpeed = parseInt(val);
      
      snapshot.updatedAt = row.timestamp;
    });
    
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching telemetry' });
  }
});

// --- Control Endpoints ---
app.post('/api/control', async (req, res) => {
  const { deviceId, controlType, command } = req.body;
  const topic = `simplehome/control/${controlType}`;
  
  try {
    publishCommand(topic, command);
    
    await query(
      'INSERT INTO control_logs (device_id, action, payload) VALUES ($1, $2, $3)',
      [deviceId, controlType, command]
    );
    
    res.json({ message: 'Command sent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending command' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[SERVER] SimpleHome Backend running on port ${PORT}`);
});
