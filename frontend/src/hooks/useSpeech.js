import { useCallback, useEffect, useRef, useState } from 'react'

export function useSpeech({ onTranscript, onError, enabled = true }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [supported, setSupported] = useState({ stt: false, tts: false })
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported({
      stt: !!SpeechRecognition,
      tts: 'speechSynthesis' in window,
    })

    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event) => {
        let text = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript
        }
        setTranscript(text)
        if (event.results[event.results.length - 1].isFinal) {
          onTranscript?.(text.trim())
        }
      }

      rec.onend = () => setListening(false)
      rec.onerror = (event) => {
        setListening(false)
        onError?.(event.error)
      }

      recognitionRef.current = rec
    }
  }, [onTranscript, onError])

  const startListening = useCallback(() => {
    if (!enabled || listening) return
    if (!recognitionRef.current) {
      onError?.('unsupported')
      return
    }
    setTranscript('')
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch (err) {
      setListening(false)
      onError?.(err?.message || 'start-failed')
    }
  }, [enabled, listening, onError])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const speak = useCallback(
    (text) => {
      if (!ttsEnabled || !supported.tts || !text) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    },
    [ttsEnabled, supported.tts]
  )

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
  }, [])

  return {
    listening,
    transcript,
    ttsEnabled,
    setTtsEnabled,
    supported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  }
}
