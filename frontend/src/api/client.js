import { API_BASE } from '../utils/constants'

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  health: () => fetch(`${API_BASE}/api/health`).then(handleResponse),

  getConversations: () =>
    fetch(`${API_BASE}/api/conversations`).then(handleResponse),

  createConversation: (title = 'New Chat') =>
    fetch(`${API_BASE}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }).then(handleResponse),

  getConversation: (id) =>
    fetch(`${API_BASE}/api/conversations/${id}`).then(handleResponse),

  renameConversation: (id, title) =>
    fetch(`${API_BASE}/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    }).then(handleResponse),

  deleteConversation: (id) =>
    fetch(`${API_BASE}/api/conversations/${id}`, { method: 'DELETE' }).then(
      handleResponse
    ),

  getDocuments: () => fetch(`${API_BASE}/api/documents`).then(handleResponse),

  uploadDocument: (file) => {
    const form = new FormData()
    form.append('file', file)
    return fetch(`${API_BASE}/api/documents/upload`, {
      method: 'POST',
      body: form,
    }).then(handleResponse)
  },

  deleteDocument: (id) =>
    fetch(`${API_BASE}/api/documents/${id}`, { method: 'DELETE' }).then(
      handleResponse
    ),

  getUsage: () => fetch(`${API_BASE}/api/usage`).then(handleResponse),

  getMemories: () => fetch(`${API_BASE}/api/memories`).then(handleResponse),

  streamChat: async ({ message, conversationId, useRag, onEvent }) => {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        use_rag: useRag,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Chat failed (${res.status})`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const event = JSON.parse(line.slice(6))
          onEvent(event)
        } catch {
          /* skip malformed */
        }
      }
    }
  },
}
