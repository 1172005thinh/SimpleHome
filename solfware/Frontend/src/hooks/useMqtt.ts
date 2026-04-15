import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mqtt, { type IClientOptions, type MqttClient } from 'mqtt'
import type {
  AlertState,
  ConnectionStatus,
  DoorAction,
  DoorStatus,
  LightMode,
  SensorState,
} from '../types/mqtt'
import { MQTT_TOPICS, SENSOR_TOPICS } from '../utils/mqttTopics'

const INITIAL_SENSOR_STATE: SensorState = {
  light: null,
  temperature: null,
  humidity: null,
  doorStatus: 'UNKNOWN',
}

const normalizeDoorStatus = (value: string): DoorStatus => {
  const normalized = value.trim().toUpperCase()
  if (normalized === 'LOCKED' || normalized === 'UNLOCKED') {
    return normalized
  }
  return 'UNKNOWN'
}

const parseNumeric = (value: string): number | null => {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const useMqtt = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [sensorState, setSensorState] = useState<SensorState>(INITIAL_SENSOR_STATE)
  const [latestAlert, setLatestAlert] = useState<AlertState | null>(null)
  const clientRef = useRef<MqttClient | null>(null)

  const brokerUrl = useMemo(
    () =>
      import.meta.env.VITE_MQTT_URL?.trim() ||
      'wss://broker.hivemq.com:8884/mqtt',
    [],
  )

  useEffect(() => {
    const options: IClientOptions = {
      connectTimeout: 10_000,
      reconnectPeriod: 3_000,
      clientId: `simplehome_dashboard_${Math.random().toString(16).slice(2, 10)}`,
      username: import.meta.env.VITE_MQTT_USERNAME?.trim() || undefined,
      password: import.meta.env.VITE_MQTT_PASSWORD?.trim() || undefined,
      clean: true,
    }

    const client = mqtt.connect(brokerUrl, options)
    clientRef.current = client

    client.on('connect', () => {
      setConnectionStatus('connected')
      client.subscribe(SENSOR_TOPICS, (error) => {
        if (error) {
          console.error('Failed to subscribe sensor topics:', error)
        }
      })
    })

    client.on('reconnect', () => {
      setConnectionStatus('reconnecting')
    })

    client.on('close', () => {
      setConnectionStatus('disconnected')
    })

    client.on('offline', () => {
      setConnectionStatus('disconnected')
    })

    client.on('error', (error) => {
      console.error('MQTT error:', error)
      setConnectionStatus('disconnected')
    })

    client.on('message', (topic, payloadBuffer) => {
      const payload = payloadBuffer.toString('utf-8').trim()

      setSensorState((previous) => {
        if (topic === MQTT_TOPICS.sensorLight) {
          return { ...previous, light: parseNumeric(payload) }
        }

        if (topic === MQTT_TOPICS.sensorTemperature) {
          return { ...previous, temperature: parseNumeric(payload) }
        }

        if (topic === MQTT_TOPICS.sensorHumidity) {
          return { ...previous, humidity: parseNumeric(payload) }
        }

        if (topic === MQTT_TOPICS.sensorDoorStatus) {
          return { ...previous, doorStatus: normalizeDoorStatus(payload) }
        }

        return previous
      })

      if (topic === MQTT_TOPICS.sensorAlert) {
        setLatestAlert({
          message: payload || 'Alert! Unauthorized entry detected. Please check your door immediately.',
          receivedAt: Date.now(),
        })
      }
    })

    return () => {
      client.removeAllListeners()
      client.end(true)
      clientRef.current = null
    }
  }, [brokerUrl])

  const publishCommand = useCallback((topic: string, payload: string): boolean => {
    const client = clientRef.current
    if (!client || !client.connected) {
      return false
    }

    client.publish(topic, payload, { qos: 0, retain: false })
    return true
  }, [])

  const publishLightMode = useCallback(
    (mode: LightMode): boolean => publishCommand(MQTT_TOPICS.controlLight, mode),
    [publishCommand],
  )

  const publishDoorAction = useCallback(
    (action: DoorAction): boolean => publishCommand(MQTT_TOPICS.controlDoor, action),
    [publishCommand],
  )

  return {
    brokerUrl,
    connectionStatus,
    sensorState,
    latestAlert,
    publishCommand,
    publishLightMode,
    publishDoorAction,
  }
}
