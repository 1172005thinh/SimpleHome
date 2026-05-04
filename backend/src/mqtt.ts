import mqtt from 'mqtt';
import { query } from './db';
import dotenv from 'dotenv';

dotenv.config();

const client = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://mosquitto_public:1883', {
  reconnectPeriod: 5000,
});

export const initMQTT = () => {
  client.on('connect', () => {
    console.log('[MQTT] Connected to Broker');
    client.subscribe('simplehome/sensor/#', (err) => {
      if (!err) {
        console.log('[MQTT] Subscribed to sensor topics');
      }
    });
  });

  client.on('message', async (topic, message) => {
    const payload = message.toString();
    console.log(`[MQTT] Received: ${topic} -> ${payload}`);

    // simplehome/sensor/temperature -> sensor_type = temperature
    const parts = topic.split('/');
    if (parts.length >= 3) {
      const sensorType = parts[2];
      const deviceId = 'simplehome-yolobit-01'; // Default for now

      try {
        await query(
          'INSERT INTO telemetry_logs (device_id, sensor_type, value) VALUES ($1, $2, $3)',
          [deviceId, sensorType, payload]
        );
        
        // Update device status and last_seen
        await query(
          'UPDATE devices SET status = $1, last_seen = NOW() WHERE device_id = $2',
          ['online', deviceId]
        );
      } catch (err) {
        console.error('[DB] Error logging telemetry:', err);
      }
    }
  });
};

export const publishCommand = (topic: string, message: string) => {
  if (!client.connected) {
    throw new Error('MQTT broker is not connected');
  }
  client.publish(topic, message);
};

export const isMQTTConnected = () => client.connected;

export default client;
