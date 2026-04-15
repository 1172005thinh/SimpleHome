import { useCallback, useMemo, useState } from 'react'
import { DoorControlWidget } from './components/DoorControlWidget'
import { Header } from './components/Header'
import { LightControlWidget } from './components/LightControlWidget'
import {
  NotificationCenter,
  type ToastMessage,
} from './components/NotificationCenter'
import { WeatherWidget } from './components/WeatherWidget'
import { useMqtt } from './hooks/useMqtt'
import type { LightMode } from './types/mqtt'

const TOAST_TTL_MS = 9000

function App() {
  const {
    brokerUrl,
    connectionStatus,
    sensorState,
    latestAlert,
    publishLightMode,
    publishDoorAction,
  } = useMqtt()

  const [lightMode, setLightMode] = useState<LightMode>('AUTO')
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const pushToast = useCallback(
    (message: string, variant: ToastMessage['variant'] = 'info') => {
      const id = Date.now() + Math.floor(Math.random() * 1000)

      setToasts((previous) => [...previous, { id, message, variant }])

      window.setTimeout(() => {
        setToasts((previous) => previous.filter((toast) => toast.id !== id))
      }, TOAST_TTL_MS)
    },
    [],
  )

  const onLightModeChange = useCallback(
    (mode: LightMode) => {
      const published = publishLightMode(mode)
      if (published) {
        setLightMode(mode)
      } else {
        pushToast('Failed to send light command. Please check MQTT connection.', 'error')
      }
    },
    [publishLightMode, pushToast],
  )

  const onDoorToggle = useCallback(() => {
    const nextAction = sensorState.doorStatus === 'LOCKED' ? 'UNLOCK' : 'LOCK'
    const published = publishDoorAction(nextAction)

    if (!published) {
      pushToast('Failed to send door command. Please check MQTT connection.', 'error')
    }
  }, [publishDoorAction, pushToast, sensorState.doorStatus])

  const mainGridClassName = useMemo(
    () =>
      'mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-4 pb-8 pt-5 sm:px-6 lg:grid-cols-3 lg:gap-6 lg:px-8',
    [],
  )

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <Header status={connectionStatus} brokerUrl={brokerUrl} />

      <main className={mainGridClassName}>
        <div className="lg:col-span-2">
          <WeatherWidget
            temperature={sensorState.temperature}
            humidity={sensorState.humidity}
            onNotify={(message) => pushToast(message, 'warning')}
          />
        </div>

        <div className="lg:col-span-1">
          <DoorControlWidget
            doorStatus={sensorState.doorStatus}
            latestAlert={latestAlert}
            onToggleDoor={onDoorToggle}
          />
        </div>

        <div className="lg:col-span-3">
          <LightControlWidget
            lightValue={sensorState.light}
            currentMode={lightMode}
            onModeChange={onLightModeChange}
          />
        </div>
      </main>

      <NotificationCenter
        toasts={toasts}
        onDismiss={(id) =>
          setToasts((previous) => previous.filter((toast) => toast.id !== id))
        }
      />
    </div>
  )
}

export default App
