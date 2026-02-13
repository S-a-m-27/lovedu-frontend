'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'

interface ChatMessageProps {
  message: {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    source?: 'internal' | 'web'
  }
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { isRTL, t } = useLanguage()
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(t)
  }, [copied])

  const blocks = useMemo(() => {
    // Very small “GPT-like” formatter: supports ```code``` blocks, everything else as text.
    const input = message.content || ''
    const parts = input.split(/```/g)
    return parts.map((part, idx) => {
      const isCode = idx % 2 === 1
      if (!isCode) return { type: 'text' as const, content: part }
      // optional language line at start
      const lines = part.split('\n')
      const maybeLang = (lines[0] || '').trim()
      const lang = /^[a-zA-Z0-9+#.-]{1,20}$/.test(maybeLang) ? maybeLang : ''
      const code = lang ? lines.slice(1).join('\n') : part
      return { type: 'code' as const, lang, content: code.replace(/\n$/, '') }
    })
  }, [message.content])

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content || '')
      setCopied(true)
    } catch {
      // ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group flex gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5 ${
        isUser 
          ? (isRTL ? 'justify-start' : 'justify-end')
          : (isRTL ? 'justify-end' : 'justify-start')
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-200" />
          </div>
        </div>
      )}
      
      <div className={`${isUser ? (isRTL ? 'order-last' : 'order-first') : ''} w-full max-w-[90%] sm:max-w-[85%] md:max-w-[70%]`}>
        <div
          className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 border ${
            isUser
              ? `bg-white/[0.03] text-white border-[#2563eb]/30 ${isRTL ? 'mr-auto' : 'ml-auto'} shadow-sm ring-1 ring-[#2563eb]/10`
              : 'bg-white/[0.04] text-white border-white/10'
          }`}
        >
          <div className={`text-xs sm:text-sm md:text-base leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {blocks.map((b, i) => {
              if (b.type === 'code') {
                return (
                  <pre
                    key={`code-${i}`}
                    className="mt-3 mb-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[12px] md:text-[13px] leading-relaxed"
                  >
                    <code>{b.content}</code>
                  </pre>
                )
              }
              return (
                <span key={`text-${i}`} className="whitespace-pre-wrap">
                  {b.content}
                </span>
              )
            })}
          </div>
        </div>
        
        {/* Source label intentionally removed from UI */}
        
        <div className={`mt-1 flex items-center justify-between gap-3 ${
          isUser 
            ? (isRTL ? '' : 'flex-row-reverse')
            : (isRTL ? 'flex-row-reverse' : '')
        }`}>
          <div className={`text-[11px] text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString()}
          </div>
          <button
            type="button"
            onClick={copyText}
            className={`opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-200 text-[11px] flex items-center gap-1 ${
              isRTL ? 'justify-start' : 'justify-end'
            }`}
            aria-label="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? t('chat.message.copied') : t('chat.message.copy')}</span>
          </button>
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-200" />
          </div>
        </div>
      )}
    </motion.div>
  )
}

