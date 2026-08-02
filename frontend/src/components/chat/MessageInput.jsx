import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import VoiceControls from '../voice/VoiceControls'

export default function MessageInput({
  onSend,
  streaming,
  onUpload,
  uploading,
  documents,
  useRag,
  onToggleRag,
  onDeleteDocument,
  speech,
}) {
  const [text, setText] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (speech?.transcript) setText(speech.transcript)
  }, [speech?.transcript])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || streaming) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-odyssey-border/60 bg-odyssey-surface/50 backdrop-blur-xl px-4 sm:px-6 py-4">
      {documents?.length > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {documents.map((doc) => (
            <span
              key={doc.id}
              className="inline-flex items-center gap-1.5 text-xs pl-2.5 pr-1.5 py-1 rounded-lg bg-odyssey-elevated border border-odyssey-border text-odyssey-muted"
            >
              <svg className="w-3 h-3 text-odyssey-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {doc.filename}
              <button
                type="button"
                onClick={() => onDeleteDocument?.(doc.id)}
                className="ml-0.5 p-0.5 rounded hover:bg-odyssey-danger/20 hover:text-odyssey-danger transition-colors"
                title={`Remove ${doc.filename}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <button
            onClick={onToggleRag}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              useRag
                ? 'border-odyssey-accent/40 text-odyssey-accent bg-odyssey-accent/10'
                : 'border-odyssey-border text-odyssey-muted'
            }`}
          >
            RAG {useRag ? 'on' : 'off'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />

        <Button
          type="button"
          variant="ghost"
          className="!px-3 !py-3 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          title="Upload PDF or text file"
        >
          {uploading ? (
            <motion.div
              className="w-5 h-5 border-2 border-odyssey-accent/30 border-t-odyssey-accent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </Button>

        <VoiceControls speech={speech} disabled={streaming} />

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Odyssey..."
            rows={1}
            disabled={streaming}
            className="w-full resize-none rounded-2xl bg-odyssey-elevated border border-odyssey-border/60
              px-4 py-3 pr-12 text-sm text-odyssey-text placeholder:text-odyssey-muted
              focus:outline-none focus:border-odyssey-accent/50 focus:ring-1 focus:ring-odyssey-accent/20
              disabled:opacity-50 transition-colors max-h-32"
            style={{ minHeight: '48px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={!text.trim() || streaming}
          className="!px-4 !py-3 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </form>
    </div>
  )
}
