'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { ChatSidebar } from '@/components/ChatSidebar'
import { ChatMessage } from '@/components/ChatMessage'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/apiClient'
import { Send, Loader2, Menu, X, ChevronDown, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  source?: 'internal' | 'web'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedAssistant, setSelectedAssistant] = useState('typeX')
  const [chatSessionId, setChatSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0)
  const [currentCourseName, setCurrentCourseName] = useState<string | null>(null)
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isRTL, t, language } = useLanguage()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    // Prefer scrollIntoView (works even if container changes)
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const getAssistantName = (id: string) => {
    const assistants = {
      typeX: t('chat.assistants.typeX'),
      references: t('chat.assistants.references'),
      academicReferences: t('chat.assistants.academicReferences'),
      therapyGPT: t('chat.assistants.therapyGPT'),
      whatsTrendy: t('chat.assistants.whatsTrendy')
    }
    return assistants[id as keyof typeof assistants] || t('chat.assistants.typeX')
  }

  const getWelcomeMessage = (assistantId: string) => {
    const welcomeMessages: Record<string, string> = {
      typeX: t('chat.welcomeMessages.typeX'),
      references: t('chat.welcomeMessages.references'),
      academicReferences: t('chat.welcomeMessages.academicReferences'),
      therapyGPT: t('chat.welcomeMessages.therapyGPT'),
      whatsTrendy: t('chat.welcomeMessages.whatsTrendy'),
      course: t('chat.welcomeMessages.course')
    }
    return welcomeMessages[assistantId] || welcomeMessages.typeX
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update welcome message when language changes (avoid stale translated text)
  useEffect(() => {
    if (
      messages.length === 1 &&
      messages[0]?.id === 'welcome' &&
      messages[0]?.role === 'assistant'
    ) {
      setMessages([
        {
          ...messages[0],
          content: getWelcomeMessage(currentCourseName ? 'course' : selectedAssistant),
        }
      ])
    }
  }, [language, selectedAssistant, currentCourseName])

  // Track whether user is near bottom (for scroll-to-bottom affordance)
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    const onScroll = () => {
      const threshold = 140
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      setShowScrollToBottom(distanceFromBottom > threshold)
    }

    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Auto-resize the composer textarea (ChatGPT-like)
  useEffect(() => {
    const el = composerRef.current
    if (!el) return
    el.style.height = '0px'
    const next = Math.min(el.scrollHeight, 160)
    el.style.height = `${next}px`
  }, [inputValue])

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Load chat sessions and history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true)
        // Get all chat sessions
        const sessionsResponse = await apiClient.getChatSessions()

        if (sessionsResponse.error) {
          console.error('Failed to load chat sessions:', sessionsResponse.error)
          // Show welcome message on error
          setMessages([
            {
              id: 'welcome',
              content: getWelcomeMessage(selectedAssistant),
              role: 'assistant',
              timestamp: new Date(),
              source: 'internal'
            }
          ])
          setLoading(false)
          return
        }

        if (sessionsResponse.data && Array.isArray(sessionsResponse.data) && sessionsResponse.data.length > 0) {
          // Load the most recent session
          const sessions = sessionsResponse.data as any[]
          const mostRecentSession = sessions[0]

          if (mostRecentSession && mostRecentSession.id) {
            // IMPORTANT: Update selected assistant FIRST based on the session's assistant_id
            // This ensures the UI shows the correct assistant before loading messages
            if (mostRecentSession.assistant_id) {
              setSelectedAssistant(mostRecentSession.assistant_id)
            }
            
            // Update course name and ID if it's a course chat (from the session list data)
            if (mostRecentSession.course_id && mostRecentSession.course_name) {
              setCurrentCourseName(mostRecentSession.course_name)
              setCurrentCourseId(mostRecentSession.course_id)
            } else {
              setCurrentCourseName(null)
              setCurrentCourseId(null)
            }

            // Load the session with messages
            const sessionResponse = await apiClient.getChatSession(mostRecentSession.id)

            if (sessionResponse.error) {
              console.error('Failed to load session:', sessionResponse.error)
              setMessages([
                {
                  id: 'welcome',
                  content: getWelcomeMessage(mostRecentSession.assistant_id || selectedAssistant),
                  role: 'assistant',
                  timestamp: new Date(),
                  source: 'internal'
                }
              ])
              setLoading(false)
              return
            }

            if (sessionResponse.data) {
              const sessionData = sessionResponse.data
              setChatSessionId(mostRecentSession.id)

              // Ensure selectedAssistant matches the session (in case session data differs)
              if (sessionData.session && sessionData.session.assistant_id) {
                const sessionAssistantId = sessionData.session.assistant_id
                setSelectedAssistant(sessionAssistantId)
                
                // Update course name and ID if it's a course chat
                if (sessionData.session.course_id && sessionData.session.course_name) {
                  setCurrentCourseName(sessionData.session.course_name)
                  setCurrentCourseId(sessionData.session.course_id)
                } else {
                  setCurrentCourseName(null)
                  setCurrentCourseId(null)
                }
              }

              // Convert backend messages to frontend format
              const convertedMessages: Message[] = sessionData.messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                timestamp: new Date(msg.timestamp),
                source: msg.source
              }))

              // If no messages, show welcome message for the correct assistant
              if (convertedMessages.length === 0) {
                const assistantId = sessionData.session?.assistant_id || mostRecentSession.assistant_id || selectedAssistant
                setMessages([
                  {
                    id: 'welcome',
                    content: getWelcomeMessage(assistantId),
                    role: 'assistant',
                    timestamp: new Date(),
                    source: 'internal'
                  }
                ])
              } else {
                setMessages(convertedMessages)
              }
            }
          } else {
            // No valid session, show welcome message
            setMessages([
              {
                id: 'welcome',
                content: getWelcomeMessage(selectedAssistant),
                role: 'assistant',
                timestamp: new Date(),
                source: 'internal'
              }
            ])
          }
        } else {
          // No sessions, show welcome message
          setMessages([
            {
              id: 'welcome',
              content: getWelcomeMessage(selectedAssistant),
              role: 'assistant',
              timestamp: new Date(),
              source: 'internal'
            }
          ])
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        // Show welcome message on error
        setMessages([
          {
            id: 'welcome',
            content: getWelcomeMessage(selectedAssistant),
            role: 'assistant',
            timestamp: new Date(),
            source: 'internal'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadChatHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return

    const messageContent = inputValue.trim()
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.sendChatMessage(
        messageContent,
        selectedAssistant,
        'gpt', // Always use GPT mode
        chatSessionId || undefined,
        currentCourseId || undefined  // Pass course_id for course chats
      )

      if (response.error) {
        setError(response.error)
        setLoading(false)
        return
      }

      if (response.data) {
        const chatResponse = response.data as any

        // Update session ID if this is a new session
        if (chatResponse.chat_session_id && !chatSessionId) {
          setChatSessionId(chatResponse.chat_session_id)
          // Trigger sidebar refresh to show new session
          setSidebarRefreshTrigger(prev => prev + 1)
        }

        // Convert backend message to frontend format
        const assistantMessage: Message = {
          id: chatResponse.message.id,
          content: chatResponse.message.content,
          role: 'assistant',
          timestamp: new Date(chatResponse.message.timestamp),
          source: chatResponse.message.source
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError(t('chat.errors.failedToSend'))
    } finally {
      setLoading(false)
    }
  }

  const handleComposerKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // Enter to send, Shift+Enter for newline (ChatGPT-like)
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isWelcomeOnly =
    messages.length === 1 && messages[0]?.id === 'welcome' && messages[0]?.role === 'assistant'

  const suggestionChips = (() => {
    const assistant = currentCourseName ? 'course' : selectedAssistant
    const suggestions = t(`chat.suggestions.${assistant}`)
    // t() returns the array directly from translations
    if (Array.isArray(suggestions)) {
      return suggestions
    }
    // Fallback to typeX if translation fails
    const fallback = t('chat.suggestions.typeX')
    return Array.isArray(fallback) ? fallback : []
  })()

  const handleNewChat = async () => {
    setChatSessionId(null)
    setCurrentCourseName(null)
    setCurrentCourseId(null)
    setMessages([
      {
        id: 'welcome',
        content: getWelcomeMessage(selectedAssistant),
        role: 'assistant',
        timestamp: new Date(),
        source: 'internal'
      }
    ])
    setError(null)
  }

  const handleSessionSelect = async (sessionId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getChatSession(sessionId)
      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        const sessionData = response.data as any
        setChatSessionId(sessionId)
        
        // Update assistant and course info
        if (sessionData.session && sessionData.session.assistant_id) {
          setSelectedAssistant(sessionData.session.assistant_id)
        }
        
        // Update course name and ID if it's a course chat
        if (sessionData.session?.course_id && sessionData.session?.course_name) {
          setCurrentCourseName(sessionData.session.course_name)
          setCurrentCourseId(sessionData.session.course_id)
        } else {
          setCurrentCourseName(null)
          setCurrentCourseId(null)
        }

        // Convert backend messages to frontend format
        const convertedMessages: Message[] = sessionData.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp),
          source: msg.source
        }))

        setMessages(convertedMessages)

        // Update selected assistant based on session
        if (sessionData.session.assistant_id) {
          setSelectedAssistant(sessionData.session.assistant_id)
        }

        // Update course name and ID if it's a course chat
        if (sessionData.session.course_id && sessionData.session.course_name) {
          setCurrentCourseName(sessionData.session.course_name)
          setCurrentCourseId(sessionData.session.course_id)
        } else {
          setCurrentCourseName(null)
          setCurrentCourseId(null)
        }
      }
    } catch (err) {
      console.error('Error loading session:', err)
      setError(t('chat.errors.failedToLoadSession'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`flex h-screen bg-[#071225] text-white ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Sidebar (Desktop) */}
      <div className="hidden md:block">
      <ChatSidebar
        selectedAssistant={selectedAssistant}
        onAssistantChange={setSelectedAssistant}
        onNewChat={handleNewChat}
        onSessionSelect={handleSessionSelect}
        refreshTrigger={sidebarRefreshTrigger}
      />
      </div>

      {/* Sidebar (Mobile Drawer) */}
      <div className="md:hidden">
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
          />
        )}

        <div
          className={[
            'fixed top-0 z-50 h-screen w-[84vw] max-w-[340px] transition-transform duration-200 ease-out overflow-hidden',
            isRTL ? 'right-0' : 'left-0',
            mobileSidebarOpen
              ? 'translate-x-0'
              : isRTL
                ? 'translate-x-full'
                : '-translate-x-full',
          ].join(' ')}
        >
          <div className="h-full">
            <ChatSidebar
              selectedAssistant={selectedAssistant}
              onAssistantChange={(assistant) => {
                setSelectedAssistant(assistant)
                setMobileSidebarOpen(false)
              }}
              onNewChat={() => {
                handleNewChat()
                setMobileSidebarOpen(false)
              }}
              onSessionSelect={(id) => {
                handleSessionSelect(id)
                setMobileSidebarOpen(false)
              }}
              refreshTrigger={sidebarRefreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#071225]/80 backdrop-blur-md border-b border-white/10">
          <div className="px-4 md:px-6 py-2.5">
            <div className="flex items-center justify-between max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMobileSidebarOpen((v) => !v)}
                className="md:hidden text-gray-300 hover:text-white hover:bg-white/5 px-2"
                aria-label={mobileSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

            <div>
                <h2 className="text-base md:text-lg font-semibold text-white leading-tight">
                  {currentCourseName || getAssistantName(selectedAssistant)}
              </h2>
                <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                  {t('common.kuniv')}
              </p>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto relative" ref={scrollContainerRef}>
          {/* subtle GPT-like background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_0%,rgba(37,99,235,0.10),transparent_55%),radial-gradient(600px_circle_at_80%_20%,rgba(255,255,255,0.06),transparent_55%)]" />

          <div className="px-4 md:px-6 py-6 md:py-8 relative">
            <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
              {isWelcomeOnly ? (
                <div className="pt-10 md:pt-16">
                  <div className="max-w-2xl">
                    <h1 className={`text-2xl md:text-3xl font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                      {currentCourseName || getAssistantName(selectedAssistant)}
                    </h1>
                    <p className={`mt-2 text-sm md:text-base text-gray-400 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                      {messages[0].content}
                    </p>

                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      {suggestionChips.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setInputValue(s)
                            setTimeout(() => composerRef.current?.focus(), 0)
                          }}
                          className={`${isRTL ? 'text-right' : 'text-left'} rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-4 py-3 text-sm text-gray-200`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
                </>
              )}
            <div ref={messagesEndRef} />
            </div>
          </div>

          {showScrollToBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom('smooth')}
              className={[
                'fixed z-30',
                'bottom-[118px] md:bottom-[132px]',
                isRTL ? 'left-5' : 'right-5',
                'h-10 w-10 rounded-full border border-white/10 bg-[#071225]/80 backdrop-blur-md hover:bg-white/5 transition-colors flex items-center justify-center shadow-sm'
              ].join(' ')}
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-5 w-5 text-gray-200" />
            </button>
          )}
        </div>

        {/* Error Toast */}
        {error && (
          <div className="fixed top-20 z-50 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] animate-in slide-in-from-top-2 fade-in duration-200">
            <div className={`bg-red-950/95 border border-red-800/50 rounded-lg shadow-lg backdrop-blur-sm p-3 flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-red-200 leading-relaxed break-words ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-900/30"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#071225]/80 backdrop-blur-md">
          <div className="px-4 md:px-6 py-4">
            <div className="max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full">
              <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 shadow-sm">
                <textarea
                value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value)
                    // Clear error when user starts typing
                    if (error) setError(null)
                  }}
                  onKeyDown={handleComposerKeyDown}
                placeholder={t('common.typeMessage')}
                disabled={loading}
                  rows={1}
                  ref={composerRef}
                  className="flex-1 resize-none bg-transparent text-sm md:text-base text-white placeholder:text-gray-500 focus:outline-none leading-6 max-h-36 py-2"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                  className="h-10 w-10 p-0 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-50"
                  aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                {t('chat.composer.hint')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

