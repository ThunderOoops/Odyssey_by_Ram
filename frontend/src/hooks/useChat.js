import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import { useToast } from './useToast'

export function useChat(conversationId, onConversationCreated) {
  const { toast } = useToast()
  const [messages, setMessages] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const abortRef = useRef(false)

  useEffect(() => {
    abortRef.current = false
    if (!conversationId) {
      setMessages([])
      return
    }

    setLoadingHistory(true)
    api
      .getConversation(conversationId)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => toast(err.message, 'error'))
      .finally(() => setLoadingHistory(false))
  }, [conversationId, toast])

  const sendMessage = useCallback(
    async (text, { useRag = true } = {}) => {
      if (!text.trim() || streaming) return

      const userMsg = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        citations: [],
      }

      const assistantPlaceholder = {
        id: `temp-assistant-${Date.now()}`,
        role: 'model',
        content: '',
        citations: [],
        streaming: true,
      }

      setMessages((prev) => [...prev, userMsg, assistantPlaceholder])
      setStreaming(true)
      abortRef.current = false

      let currentConvId = conversationId
      let citations = []

      try {
        await api.streamChat({
          message: text.trim(),
          conversationId,
          useRag,
          onEvent: (event) => {
            if (abortRef.current) return

            if (event.type === 'start') {
              currentConvId = event.conversation_id
              citations = event.citations || []
              if (!conversationId && onConversationCreated) {
                onConversationCreated(event.conversation_id)
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.streaming ? { ...m, citations } : m
                )
              )
            }

            if (event.type === 'token') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.streaming
                    ? { ...m, content: m.content + event.content }
                    : m
                )
              )
            }

            if (event.type === 'error') {
              toast(event.message, 'error')
            }

            if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.streaming ? { ...m, streaming: false } : m
                )
              )
            }
          },
        })
      } catch (err) {
        toast(err.message, 'error')
        setMessages((prev) => prev.filter((m) => !m.streaming))
      } finally {
        setStreaming(false)
        setMessages((prev) =>
          prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
        )
      }

      return currentConvId
    },
    [conversationId, streaming, toast, onConversationCreated]
  )

  const clearMessages = useCallback(() => setMessages([]), [])

  return {
    messages,
    streaming,
    loadingHistory,
    sendMessage,
    clearMessages,
  }
}
