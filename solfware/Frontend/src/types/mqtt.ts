export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected'

export type DoorStatus = 'LOCKED' | 'UNLOCKED' | 'UNKNOWN'

export type LightMode = 'AUTO' | 'ON' | 'OFF'

export type DoorAction = 'LOCK' | 'UNLOCK'

export interface SensorState {
  light: number | null
  temperature: number | null
  humidity: number | null
  doorStatus: DoorStatus
}

export interface AlertState {
  message: string
  receivedAt: number
}

export interface MqttTopics {
  sensorLight: string
  sensorTemperature: string
  sensorHumidity: string
  sensorDoorStatus: string
  sensorAlert: string
  controlLight: string
  controlDoor: string
}
