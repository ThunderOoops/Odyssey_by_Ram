import { motion } from 'framer-motion'

function LogoMark() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <path
        d="M8 22 L16 8 L24 22"
        stroke="#00E5FF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="18" r="2" fill="#00E5FF" />
    </svg>
  )
}

export default function Header({ onToggleSidebar, sidebarOpen }) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-odyssey-border/60 bg-odyssey-surface/30 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-odyssey-elevated transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <LogoMark />
          <span className="font-display text-xl font-bold tracking-tight">
            Odyssey
          </span>
        </motion.div>
      </div>

      <div className="hidden sm:flex items-center gap-2 text-xs text-odyssey-muted">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        Gemini powered
      </div>
    </header>
  )
}
