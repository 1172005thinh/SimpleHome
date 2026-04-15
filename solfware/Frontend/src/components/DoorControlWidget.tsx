import { useState } from 'react'
import type { AlertState, DoorStatus } from '../types/mqtt'

interface DoorControlWidgetProps {
  doorStatus: DoorStatus
  latestAlert: AlertState | null
  onToggleDoor: () => void
}

const statusStyles: Record<DoorStatus, string> = {
  LOCKED: 'bg-rose-100 text-rose-700 ring-1 ring-rose-700/20',
  UNLOCKED: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/20',
  UNKNOWN: 'bg-slate-100 text-slate-600 ring-1 ring-slate-600/20',
}

export const DoorControlWidget = ({
  doorStatus,
  latestAlert,
  onToggleDoor,
}: DoorControlWidgetProps) => {
  const [dismissedAlertAt, setDismissedAlertAt] = useState<number | null>(null)

  const showAlertModal =
    latestAlert !== null && latestAlert.receivedAt !== dismissedAlertAt

  const lockLabel = doorStatus === 'LOCKED' ? 'Unlock Door' : 'Lock Door'

  return (
    <>
      <section className="card-glass rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-slate-900">Secured Door Monitoring</h2>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[doorStatus]}`}>
            {doorStatus}
          </span>
        </div>

        <div className="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200/70">
          <p className="text-sm text-slate-600">
            Status:{' '}
            <strong className="font-semibold text-slate-900">
              {doorStatus === 'LOCKED'
                ? 'Door is currently locked.'
                : doorStatus === 'UNLOCKED'
                  ? 'Door is currently unlocked.'
                  : 'No status received yet.'}
            </strong>
          </p>
          <button
            type="button"
            onClick={onToggleDoor}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {lockLabel}
          </button>
        </div>
      </section>

      {showAlertModal && latestAlert && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/65 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-rose-900/30">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">
              Security Alert
            </p>
            <h3 className="mt-2 font-display text-2xl text-slate-900">
              Alert! Unauthorized entry detected.
            </h3>
            <p className="mt-3 text-sm text-slate-600">{latestAlert.message}</p>
            <button
              type="button"
              onClick={() => setDismissedAlertAt(latestAlert.receivedAt)}
              className="mt-5 w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
