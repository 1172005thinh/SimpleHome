import { useEffect, useRef } from 'react'
import { getWeatherAdvice } from '../utils/weatherAdvice'

interface WeatherWidgetProps {
  temperature: number | null
  humidity: number | null
  onNotify: (message: string) => void
}

const valueOrDash = (value: number | null, digits = 1) =>
  value === null ? '--' : value.toFixed(digits)

export const WeatherWidget = ({ temperature, humidity, onNotify }: WeatherWidgetProps) => {
  const lastAdviceKey = useRef<string | null>(null)

  useEffect(() => {
    const advice = getWeatherAdvice(temperature, humidity)
    if (advice.key && advice.message && advice.key !== lastAdviceKey.current) {
      lastAdviceKey.current = advice.key
      onNotify(advice.message)
    }
    if (!advice.key) {
      lastAdviceKey.current = null
    }
  }, [humidity, onNotify, temperature])

  return (
    <section className="card-glass rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-slate-900">Temperature & Humidity</h2>
        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
          Every 5s
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70">
          <p className="text-xs uppercase tracking-widest text-slate-500">Temperature</p>
          <p className="mt-2 font-display text-3xl text-slate-900">{valueOrDash(temperature)}°C</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70">
          <p className="text-xs uppercase tracking-widest text-slate-500">Humidity</p>
          <p className="mt-2 font-display text-3xl text-slate-900">{valueOrDash(humidity)}%</p>
        </div>
      </div>
    </section>
  )
}
