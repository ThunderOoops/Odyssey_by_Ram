import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api/client'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import UsagePanel from './components/layout/UsagePanel'
import ChatArea from './components/chat/ChatArea'
import MessageInput from './components/chat/MessageInput'
import ToastContainer from './components/ui/Toast'
import { ToastProvider, useToast } from './hooks/useToast'
import { useConversations } from './hooks/useConversations'
import { useChat } from './hooks/useChat'
import { useSpeech } from './hooks/useSpeech'

function OdysseyApp() {
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [useRag, setUseRag] = useState(true)
  const [usageRefresh, setUsageRefresh] = useState(0)
  const lastSpokenRef = useRef('')

  const {
    conversations,
    loading: convsLoading,
    activeId,
    setActiveId,
    create,
    rename,
    remove,
    refresh: refreshConversations,
  } = useConversations()

  const handleConversationCreated = useCallback(
    (id) => {
      setActiveId(id)
      refreshConversations()
    },
    [setActiveId, refreshConversations]
  )

  const { messages, streaming, loadingHistory, sendMessage } = useChat(
    activeId,
    handleConversationCreated
  )

  const handleSpeechError = useCallback(
    (error) => {
      const messages = {
        'not-allowed': 'Microphone access was denied. Allow mic permission in your browser settings.',
        'no-speech': 'No speech detected. Try again and speak right after tapping the mic.',
        'audio-capture': 'No microphone found. Check your device has a working mic.',
        unsupported: 'Voice input isn\'t supported in this browser. Try Chrome or Edge.',
        network: 'Network error during speech recognition. Check your connection.',
      }
      toast(messages[error] || `Voice input error: ${error}`, 'error')
    },
    [toast]
  )

  const speech = useSpeech({ onError: handleSpeechError })

  useEffect(() => {
    api.getDocuments().then(setDocuments).catch(() => {})
  }, [])

  useEffect(() => {
    const lastAssistant = [...messages].reverse().find(
      (m) => m.role === 'model' && m.content && !m.streaming
    )
    if (
      lastAssistant &&
      lastAssistant.content !== lastSpokenRef.current &&
      speech.ttsEnabled
    ) {
      lastSpokenRef.current = lastAssistant.content
      speech.speak(lastAssistant.content)
    }
  }, [messages, speech])

  const handleSend = async (text) => {
    await sendMessage(text, { useRag })
    setUsageRefresh((n) => n + 1)
    refreshConversations()
  }

  const handleUpload = async (file) => {
    setUploading(true)
    try {
      const doc = await api.uploadDocument(file)
      setDocuments((prev) => [doc, ...prev])
      toast(`Uploaded ${doc.filename}`, 'success')
      setUsageRefresh((n) => n + 1)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (docId) => {
    const doc = documents.find((d) => d.id === docId)
    try {
      await api.deleteDocument(docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId))
      toast(`Removed ${doc?.filename || 'file'}`, 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const handleNewChat = async () => {
    const conv = await create()
    if (conv) setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-odyssey-bg">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onCreate={handleNewChat}
        onRename={rename}
        onDelete={remove}
        loading={convsLoading}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <UsagePanel refreshTrigger={usageRefresh} />
        <ChatArea
          messages={messages}
          loadingHistory={loadingHistory}
          streaming={streaming}
        />
        <MessageInput
          onSend={handleSend}
          streaming={streaming}
          onUpload={handleUpload}
          uploading={uploading}
          documents={documents}
          useRag={useRag}
          onToggleRag={() => setUseRag(!useRag)}
          onDeleteDocument={handleDeleteDocument}
          speech={speech}
        />
      </div>

      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <OdysseyApp />
    </ToastProvider>
  )
}
