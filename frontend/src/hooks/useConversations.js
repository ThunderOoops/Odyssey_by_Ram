import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useToast } from './useToast'

export function useConversations() {
  const { toast } = useToast()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const data = await api.getConversations()
      setConversations(data)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async () => {
    try {
      const conv = await api.createConversation()
      setConversations((prev) => [conv, ...prev])
      setActiveId(conv.id)
      return conv
    } catch (err) {
      toast(err.message, 'error')
    }
  }, [toast])

  const rename = useCallback(
    async (id, title) => {
      try {
        await api.renameConversation(id, title)
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title } : c))
        )
      } catch (err) {
        toast(err.message, 'error')
      }
    },
    [toast]
  )

  const remove = useCallback(
    async (id) => {
      try {
        await api.deleteConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))
        if (activeId === id) setActiveId(null)
      } catch (err) {
        toast(err.message, 'error')
      }
    },
    [activeId, toast]
  )

  return {
    conversations,
    loading,
    activeId,
    setActiveId,
    create,
    rename,
    remove,
    refresh,
  }
}
