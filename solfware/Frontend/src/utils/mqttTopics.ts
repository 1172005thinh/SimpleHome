import type { MqttTopics } from '../types/mqtt'

export const MQTT_TOPICS: MqttTopics = {
  sensorLight: 'simplehome/sensor/light',
  sensorTemperature: 'simplehome/sensor/temperature',
  sensorHumidity: 'simplehome/sensor/humidity',
  sensorDoorStatus: 'simplehome/sensor/door_status',
  sensorAlert: 'simplehome/sensor/alert',
  controlLight: 'simplehome/control/light',
  controlDoor: 'simplehome/control/door',
}

export const SENSOR_TOPICS = [
  MQTT_TOPICS.sensorLight,
  MQTT_TOPICS.sensorTemperature,
  MQTT_TOPICS.sensorHumidity,
  MQTT_TOPICS.sensorDoorStatus,
  MQTT_TOPICS.sensorAlert,
]
