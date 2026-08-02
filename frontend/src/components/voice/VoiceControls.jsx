import { motion } from 'framer-motion'
import Button from '../ui/Button'

export default function VoiceControls({ speech, disabled }) {
  const { listening, ttsEnabled, setTtsEnabled, supported, startListening, stopListening } =
    speech

  if (!supported.stt && !supported.tts) return null

  return (
    <>
      {supported.stt && (
        <Button
          type="button"
          variant={listening ? 'primary' : 'ghost'}
          className={`!px-3 !py-3 shrink-0 ${listening ? 'ring-2 ring-odyssey-accent/40' : ''}`}
          onClick={listening ? stopListening : startListening}
          disabled={disabled}
          title="Voice input"
        >
          <motion.svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            animate={listening ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1, repeat: listening ? Infinity : 0 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </motion.svg>
        </Button>
      )}

      {supported.tts && (
        <Button
          type="button"
          variant={ttsEnabled ? 'outline' : 'ghost'}
          className={`!px-3 !py-3 shrink-0 ${ttsEnabled ? 'border-odyssey-accent/40 text-odyssey-accent' : ''}`}
          onClick={() => setTtsEnabled(!ttsEnabled)}
          title="Toggle read-aloud"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {ttsEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-6-6h6m6 0a9 9 0 010 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 9l4 4m0-4l-4 4" />
            )}
          </svg>
        </Button>
      )}
    </>
  )
}
