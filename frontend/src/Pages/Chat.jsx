import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Plus, Trash2, Loader2, Menu, X, Sparkles, MessageCircle } from 'lucide-react'
import { useData } from '../Contexts/DataContext'
import useMeta from '../utils/useMeta'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import 'katex/dist/katex.min.css'
import {
  sendMessageStream,
  getMessageLimits,
  getConversations,
  getConversation,
  deleteConversation
} from '../api/chatApi'

// Composant pour le rendu du code avec coloration syntaxique
const CodeBlock = ({ inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''

  if (!inline && language) {
    return (
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        PreTag="div"
        className="rounded-lg !my-3 !text-sm"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    )
  }

  if (!inline && !language && String(children).includes('\n')) {
    return (
      <SyntaxHighlighter
        style={oneDark}
        language="text"
        PreTag="div"
        className="rounded-lg !my-3 !text-sm"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    )
  }

  return (
    <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent text-sm" {...props}>
      {children}
    </code>
  )
}

// Composants personnalisés pour ReactMarkdown
const markdownComponents = {
  code: CodeBlock,
  // Style des tables
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border border-white/20 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="bg-white/10 px-3 py-2 text-left text-sm font-medium border-b border-white/20">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-sm border-b border-white/10">
      {children}
    </td>
  ),
  // Style des blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-accent/50 pl-4 my-3 italic text-text-secondary">
      {children}
    </blockquote>
  ),
  // Style des liens
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
      {children}
    </a>
  ),
  // Style des listes
  ul: ({ children }) => (
    <ul className="list-disc list-inside my-2 space-y-1">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-2 space-y-1">
      {children}
    </ol>
  ),
}

// Suggestions de questions
const SUGGESTIONS = [
  { icon: '📚', text: 'Résume-moi mon dernier cours' },
  { icon: '🧠', text: 'Explique-moi les concepts clés de mon cours' },
  { icon: '✍️', text: 'Génère des questions pour réviser' },
  { icon: '💡', text: 'Donne-moi des astuces pour mémoriser' },
]

function Chat() {
  const navigate = useNavigate()
  const { user } = useData()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const streamingContentRef = useRef('')

  useMeta({
    title: "MisterAll - Assistant IA",
    noIndex: true
  })

  // States
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [limits, setLimits] = useState({ used: 0, limit: 10, remaining: 10, isPremium: false })
  const [showSidebar, setShowSidebar] = useState(false)
  const [error, setError] = useState(null)

  // Charger les données au démarrage
  useEffect(() => {
    loadInitialData()
  }, [])

  // Scroll vers le bas
  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      const [convs, lims] = await Promise.all([
        getConversations(),
        getMessageLimits()
      ])
      setConversations(convs)
      setLimits(lims)
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadConversation = async (convId) => {
    setIsLoading(true)
    try {
      const conv = await getConversation(convId)
      setCurrentConversation(conv)
      setMessages(conv.messages || [])
      setShowSidebar(false)
    } catch (err) {
      console.error('Erreur chargement conversation:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversation = () => {
    setCurrentConversation(null)
    setMessages([])
    setShowSidebar(false)
    setStreamingContent('')
    inputRef.current?.focus()
  }

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation()
    try {
      await deleteConversation(convId)
      setConversations(prev => prev.filter(c => c._id !== convId))
      if (currentConversation?._id === convId) {
        handleNewConversation()
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()

    const message = inputValue.trim()
    if (!message || isSending) return

    if (limits.remaining <= 0) {
      setError('Limite de 100 messages/jour atteinte. Revenez demain !')
      return
    }

    setIsSending(true)
    setInputValue('')
    setError(null)
    setStreamingContent('')
    streamingContentRef.current = ''

    // Ajouter le message utilisateur
    const userMessage = {
      role: 'user',
      content: message,
      createdAt: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      await sendMessageStream(
        currentConversation?._id || null,
        message,
        // onChunk - streaming avec mise à jour immédiate
        (chunk) => {
          streamingContentRef.current += chunk
          // Forcer le re-render immédiatement avec le nouveau contenu
          setStreamingContent(prev => prev + chunk)
        },
        // onDone
        async (conversationId, newLimits) => {
          // Convertir le streaming en message final
          const finalContent = streamingContentRef.current
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: finalContent,
            createdAt: new Date().toISOString()
          }])
          setStreamingContent('')
          streamingContentRef.current = ''
          setLimits(newLimits)

          if (!currentConversation && conversationId) {
            setCurrentConversation({ _id: conversationId })
            const convs = await getConversations()
            setConversations(convs)
          }

          setIsSending(false)
        },
        // onError
        (errorMsg) => {
          setError(errorMsg)
          setStreamingContent('')
          streamingContentRef.current = ''
          setIsSending(false)
        }
      )
    } catch {
      // Le message utilisateur reste affiché, on ajoute le contenu streamé si présent
      const finalContent = streamingContentRef.current
      if (finalContent) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: finalContent,
          createdAt: new Date().toISOString()
        }])
      }
      setStreamingContent('')
      streamingContentRef.current = ''
      setIsSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading && !messages.length && !conversations.length) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect-strong border-b border-white/20">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-semibold text-text-primary">MisterAll IA</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface">
              {limits.isPremium && <Crown className="w-3.5 h-3.5 text-accent" />}
              <span className="text-xs font-medium text-text-secondary">
                {limits.remaining}/{limits.limit}
              </span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      {showSidebar && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-dark-100 border-l border-white/20 animate-slide-left">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <h2 className="font-semibold text-text-primary">Historique</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 text-text-secondary hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3">
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-dark font-medium rounded-xl transition-all hover:bg-accent/90 active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span>Nouvelle conversation</span>
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-130px)] px-3 pb-3 space-y-1">
              {conversations.length === 0 ? (
                <p className="text-text-tertiary text-sm text-center py-8">
                  Aucune conversation
                </p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv._id}
                    onClick={() => loadConversation(conv._id)}
                    className={`
                      group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all
                      ${currentConversation?._id === conv._id
                        ? 'bg-accent/10 border border-accent/30'
                        : 'hover:bg-surface border border-transparent'
                      }
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {conv.title}
                      </p>
                      <p className="text-xs text-text-tertiary mt-0.5">
                        {conv.messageCount} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streamingContent ? (
          // Page d'accueil
          <div className="h-full flex flex-col items-center justify-center px-5 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-5">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
              Salut {user?.firstname} !
            </h2>
            <p className="text-text-secondary text-center text-sm max-w-xs mb-8">
              Je connais tous tes cours. Pose-moi n'importe quelle question !
            </p>

            {/* Suggestions */}
            <div className="w-full max-w-sm space-y-2">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-surface hover:bg-surface-raised border border-white/20 hover:border-accent/30 rounded-xl transition-all text-left group"
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <span className="text-sm text-text-primary group-hover:text-accent transition-colors">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>

            {/* Info limites */}
            {!limits.isPremium && (
              <div className="mt-8 text-center">
                <p className="text-xs text-text-tertiary">
                  {limits.remaining} messages restants aujourd'hui
                </p>
              </div>
            )}
          </div>
        ) : (
          // Conversation
          <div className="px-4 py-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="w-full">
                {msg.role === 'user' ? (
                  // Message utilisateur
                  <div className="w-full bg-accent/10 border border-accent/20 rounded-2xl px-4 py-3">
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-xs text-text-tertiary mt-2">{formatTime(msg.createdAt)}</p>
                  </div>
                ) : (
                  // Message assistant
                  <div className="w-full bg-surface border border-white/20 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      <span className="text-xs font-medium text-accent">MisterAll</span>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-text-primary [&_.katex]:text-accent">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                    <p className="text-xs text-text-tertiary mt-3">{formatTime(msg.createdAt)}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Streaming en cours */}
            {(isSending || streamingContent) && (
              <div className="w-full bg-surface border border-white/20 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium text-accent">MisterAll</span>
                  {isSending && !streamingContent && (
                    <Loader2 className="w-3 h-3 text-accent animate-spin ml-1" />
                  )}
                </div>
                {streamingContent ? (
                  <div className="prose prose-invert prose-sm max-w-none text-text-primary [&_.katex]:text-accent">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={markdownComponents}
                    >
                      {streamingContent}
                    </ReactMarkdown>
                    {/* Curseur clignotant */}
                    <span className="inline-block w-2 h-4 bg-accent ml-0.5 animate-pulse" style={{ verticalAlign: 'text-bottom' }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Error Banner */}
      {error && (
        <div className="px-4 pb-2">
          <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 p-4 bg-dark border-t border-white/20">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-surface border border-white/20 rounded-xl overflow-hidden focus-within:border-accent/50 transition-colors">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Pose ta question..."
                rows={1}
                disabled={isSending || limits.remaining <= 0}
                className="
                  w-full bg-transparent text-text-primary placeholder:text-text-tertiary
                  text-sm px-4 py-3 outline-none resize-none
                  disabled:opacity-50 font-montserrat
                "
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isSending || limits.remaining <= 0}
              className="
                shrink-0 p-3 bg-accent text-dark rounded-xl
                hover:bg-accent/90 active:scale-95
                transition-all duration-200
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
              "
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
      <p className='text-text-quaternary text-[10px] text-center py-1'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>
    </div>
  )
}

export default Chat
