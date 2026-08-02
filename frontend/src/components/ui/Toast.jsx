import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../hooks/useToast'

const icons = {
  info: 'ℹ',
  error: '✕',
  success: '✓',
}

const styles = {
  info: 'border-odyssey-accent/30 bg-odyssey-elevated text-odyssey-text',
  error: 'border-odyssey-danger/40 bg-odyssey-danger/10 text-odyssey-danger',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${styles[t.type] || styles.info}`}
          >
            <span className="mt-0.5 text-sm font-bold">{icons[t.type] || icons.info}</span>
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-odyssey-muted hover:text-odyssey-text text-xs"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
