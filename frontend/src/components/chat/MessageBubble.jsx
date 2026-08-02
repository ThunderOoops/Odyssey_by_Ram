import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import Citations from './Citations'
import TypingIndicator from './TypingIndicator'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-odyssey-accent/10 border border-odyssey-accent/20 text-odyssey-text'
            : 'bg-odyssey-elevated border border-odyssey-border/50'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-odyssey-accent/20 flex items-center justify-center">
              <svg className="w-3 h-3 text-odyssey-accent" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 20h16L12 2z" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <span className="text-xs font-display font-semibold text-odyssey-accent">
              Odyssey
            </span>
          </div>
        )}

        {message.streaming && !message.content ? (
          <TypingIndicator />
        ) : (
          <div className="prose-odyssey text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  if (!inline && match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0.75rem 0',
                          borderRadius: '0.75rem',
                          fontSize: '0.8rem',
                          border: '1px solid #2A2A3A',
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    )
                  }
                  return (
                    <code
                      className="bg-odyssey-bg/80 px-1.5 py-0.5 rounded text-odyssey-accent text-[0.85em]"
                      {...props}
                    >
                      {children}
                    </code>
                  )
                },
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0 text-odyssey-text/90">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-odyssey-accent hover:underline"
                  >
                    {children}
                  </a>
                ),
                h1: ({ children }) => (
                  <h1 className="font-display text-xl font-bold mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-lg font-bold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-base font-semibold mb-1">{children}</h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && message.citations?.length > 0 && !message.streaming && (
          <div className="mt-3 border-t border-odyssey-border/50 pt-3">
            <Citations citations={message.citations} />
          </div>
        )}
      </div>
    </motion.div>
  )
}
