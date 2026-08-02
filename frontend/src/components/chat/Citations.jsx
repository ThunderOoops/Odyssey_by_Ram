import { motion } from 'framer-motion'

export default function Citations({ citations }) {
  if (!citations?.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-display font-semibold uppercase tracking-wider text-odyssey-accent">
        Sources
      </p>
      <div className="space-y-2">
        {citations.map((c, i) => (
          <motion.div
            key={`${c.filename}-${c.chunk_index}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg border border-odyssey-border/60 bg-odyssey-bg/60 px-3 py-2"
          >
            <div className="flex items-center gap-2 text-xs text-odyssey-accent mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">{c.filename}</span>
              <span className="text-odyssey-muted">chunk {c.chunk_index}</span>
            </div>
            <p className="text-xs text-odyssey-muted leading-relaxed line-clamp-3">
              {c.snippet}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
