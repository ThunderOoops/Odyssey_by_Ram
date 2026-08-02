import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../ui/Button'

export default function Sidebar({
  open,
  onClose,
  conversations,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  loading,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = (conv) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim())
    }
    setEditingId(null)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-odyssey-border/60">
        <Button onClick={onCreate} className="w-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-odyssey-accent/30 border-t-odyssey-accent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-odyssey-muted text-center py-8">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <motion.div
              key={conv.id}
              layout
              className={`group relative rounded-xl transition-colors ${
                activeId === conv.id
                  ? 'bg-odyssey-accent/10 border border-odyssey-accent/20'
                  : 'hover:bg-odyssey-elevated border border-transparent'
              }`}
            >
              {editingId === conv.id ? (
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  className="w-full bg-odyssey-bg border border-odyssey-accent/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                />
              ) : (
                <button
                  onClick={() => {
                    onSelect(conv.id)
                    onClose?.()
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm truncate pr-16"
                >
                  {conv.title}
                </button>
              )}

              {editingId !== conv.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startEdit(conv)
                    }}
                    className="p-1.5 rounded-lg hover:bg-odyssey-elevated text-odyssey-muted hover:text-odyssey-text"
                    title="Rename"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(conv.id)
                    }}
                    className="p-1.5 rounded-lg hover:bg-odyssey-danger/10 text-odyssey-muted hover:text-odyssey-danger"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r border-odyssey-border/60 bg-odyssey-surface/50 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-50 bg-odyssey-surface border-r border-odyssey-border/60"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
