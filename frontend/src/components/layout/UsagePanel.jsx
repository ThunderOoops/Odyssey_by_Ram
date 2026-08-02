import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../api/client'

function formatCost(usd) {
  if (usd < 0.0001) return '< $0.0001'
  if (usd < 0.01) return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(3)}`
}

function formatTokens(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export default function UsagePanel({ refreshTrigger }) {
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    api.getUsage().then(setUsage).catch(() => {})
  }, [refreshTrigger])

  if (!usage) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 sm:mx-6 mt-3 mb-1"
    >
      <div className="glass-panel rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        <div>
          <span className="text-odyssey-muted">Session tokens</span>
          <p className="font-display font-semibold text-odyssey-accent text-sm">
            {formatTokens(usage.total_tokens)}
          </p>
        </div>
        <div>
          <span className="text-odyssey-muted">Input / Output</span>
          <p className="font-medium text-odyssey-text">
            {formatTokens(usage.input_tokens)} / {formatTokens(usage.output_tokens)}
          </p>
        </div>
        <div>
          <span className="text-odyssey-muted">Est. cost</span>
          <p className="font-display font-semibold text-sm">
            {formatCost(usage.estimated_cost_usd)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
