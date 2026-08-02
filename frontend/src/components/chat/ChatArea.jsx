import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import MessageBubble from './MessageBubble'

export default function ChatArea({ messages, loadingHistory, streaming }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  if (loadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-odyssey-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-odyssey-accent/10 border border-odyssey-accent/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-odyssey-accent" viewBox="0 0 32 32" fill="none">
              <path d="M8 22 L16 8 L24 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="16" cy="18" r="2" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            Where will you go?
          </h2>
          <p className="text-odyssey-muted text-sm sm:text-base leading-relaxed">
            Ask anything. Upload a document for grounded answers. Odyssey remembers what matters.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
