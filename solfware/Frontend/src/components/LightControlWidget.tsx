import type { LightMode } from '../types/mqtt'

interface LightControlWidgetProps {
  lightValue: number | null
  currentMode: LightMode
  onModeChange: (mode: LightMode) => void
}

const MODES: Array<{ label: string; value: LightMode }> = [
  { label: 'AUTO', value: 'AUTO' },
  { label: 'MANUAL ON', value: 'ON' },
  { label: 'MANUAL OFF', value: 'OFF' },
]

export const LightControlWidget = ({
  lightValue,
  currentMode,
  onModeChange,
}: LightControlWidgetProps) => {
  return (
    <section className="card-glass rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-slate-900">Day/Night Power Mode</h2>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Light: {lightValue ?? '--'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {MODES.map((mode) => {
          const active = currentMode === mode.value

          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => onModeChange(mode.value)}
              className={[
                'rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition',
                active
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-800/30'
                  : 'bg-white/75 text-slate-700 ring-1 ring-slate-200 hover:bg-white',
              ].join(' ')}
            >
              {mode.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}
