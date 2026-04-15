import type { ConnectionStatus } from '../types/mqtt'

interface HeaderProps {
  status: ConnectionStatus
  brokerUrl: string
}

const STATUS_STYLE: Record<
  ConnectionStatus,
  { label: string; chipClass: string; dotClass: string }
> = {
  connected: {
    label: 'Connected',
    chipClass: 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-700/20',
    dotClass: 'bg-emerald-500',
  },
  connecting: {
    label: 'Connecting',
    chipClass: 'bg-sky-500/15 text-sky-700 ring-1 ring-sky-700/20',
    dotClass: 'bg-sky-500 animate-pulse',
  },
  reconnecting: {
    label: 'Reconnecting',
    chipClass: 'bg-amber-500/20 text-amber-800 ring-1 ring-amber-800/20',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  disconnected: {
    label: 'Disconnected',
    chipClass: 'bg-rose-500/15 text-rose-700 ring-1 ring-rose-700/20',
    dotClass: 'bg-rose-500',
  },
}

export const Header = ({ status, brokerUrl }: HeaderProps) => {
  const statusStyle = STATUS_STYLE[status]

  return (
    <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            SimpleHome IoT Dashboard
          </p>
          <h1 className="font-display text-2xl text-slate-900 sm:text-3xl">
            Smart Home Control Center
          </h1>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${statusStyle.chipClass}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${statusStyle.dotClass}`} />
            {statusStyle.label}
          </div>
          <p className="max-w-80 truncate text-xs text-slate-500" title={brokerUrl}>
            Broker: {brokerUrl}
          </p>
        </div>
      </div>
    </header>
  )
}
