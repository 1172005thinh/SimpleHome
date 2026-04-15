export interface ToastMessage {
  id: number
  message: string
  variant: 'info' | 'warning' | 'error'
}

interface NotificationCenterProps {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}

const variantStyle: Record<ToastMessage['variant'], string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
}

export const NotificationCenter = ({ toasts, onDismiss }: NotificationCenterProps) => {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,26rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={`pointer-events-auto rounded-xl border p-3 shadow-lg ${variantStyle[toast.variant]} animate-rise-in`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-md bg-white/70 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-white"
            >
              Close
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
