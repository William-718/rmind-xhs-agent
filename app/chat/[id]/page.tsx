'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

interface Blogger {
  id: string
  name: string
  track: string
  avatar: string
  tagline: string
  reportPath: string
}

// ── Preset Questions ──────────────────────────────────────────────────────────

const PRESETS = [
  { id: 'positioning', label: '定位人设', question: '给我推荐最适合的定位和人设。' },
  { id: 'topics',      label: '选题推荐', question: '给我推荐 3 个可用选题。' },
  { id: 'diagnosis',   label: '笔记诊断', question: '帮我看看这篇笔记怎么优化。' },
  { id: 'rhythm',      label: '运营节奏', question: '我最合适的更新节奏是什么？' },
  { id: 'monetize',    label: '商业化',   question: '这个账号怎么商业化赚钱？' },
]

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadHistory(bloggerId: string): ChatSession[] {
  try { return JSON.parse(localStorage.getItem(`rmind_${bloggerId}`) || '[]') }
  catch { return [] }
}

function saveHistory(bloggerId: string, sessions: ChatSession[]) {
  try { localStorage.setItem(`rmind_${bloggerId}`, JSON.stringify(sessions.slice(0, 30))) }
  catch {}
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts
  if (d < 60000) return '刚刚'
  if (d < 3600000) return `${Math.floor(d / 60000)} 分钟前`
  if (d < 86400000) return `${Math.floor(d / 3600000)} 小时前`
  return `${Math.floor(d / 86400000)} 天前`
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function Bubble({ msg, avatar }: { msg: Message; avatar: string }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end' }}>
      {!isUser && (
        <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, border: '1.5px solid #F0E8E5', backgroundImage: `url(${avatar})`, backgroundSize: '130%', backgroundPosition: 'center' }} />
      )}
      <div style={{
        maxWidth: '74%',
        padding: isUser ? '10px 15px' : '13px 17px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        background: isUser ? '#FF2442' : '#fff',
        color: isUser ? '#fff' : '#1F1F1F',
        fontSize: 14,
        lineHeight: 1.72,
        boxShadow: isUser ? 'none' : '0 1px 6px rgba(0,0,0,0.07)',
        border: isUser ? 'none' : '1px solid #EDE5E2',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content || <span style={{ opacity: 0.35 }}>▋</span>}
      </div>
    </div>
  )
}

// ── Typing Dots ───────────────────────────────────────────────────────────────

function TypingDots({ avatar }: { avatar: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, border: '1.5px solid #F0E8E5', backgroundImage: `url(${avatar})`, backgroundSize: '130%', backgroundPosition: 'center' }} />
      <div style={{
        padding: '13px 17px', borderRadius: '4px 18px 18px 18px',
        background: '#fff', border: '1px solid #EDE5E2',
        boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#C0B8B5', display: 'inline-block',
            animation: `tdot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes tdot{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [blogger, setBlogger] = useState<Blogger | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentId, setCurrentId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [lastPresetId, setLastPresetId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingGreet = useRef(false)

  const hasUserMessages = messages.some(m => m.role === 'user')

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isInitializing])

  // Load blogger info
  useEffect(() => {
    if (!id) return
    fetch('/api/bloggers')
      .then(r => r.json())
      .then((data: Blogger[]) => {
        const found = data.find(b => b.id === id)
        if (!found) router.push('/explore')
        else setBlogger(found)
      })
  }, [id, router])

  // Init sessions once blogger is ready
  useEffect(() => {
    if (!blogger || !id) return
    const history = loadHistory(id)
    setSessions(history)
    if (history.length > 0) {
      setCurrentId(history[0].id)
      setMessages(history[0].messages)
    } else {
      pendingGreet.current = true
      createSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogger])

  // Trigger greeting after new session is set
  useEffect(() => {
    if (pendingGreet.current && currentId) {
      pendingGreet.current = false
      runStream([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId])

  // Auto-save messages to localStorage
  useEffect(() => {
    if (!id || !currentId || messages.length === 0) return
    setSessions(prev => {
      const firstUser = messages.find(m => m.role === 'user')
      const updated = prev.map(s =>
        s.id === currentId
          ? { ...s, messages, title: firstUser ? firstUser.content.slice(0, 22) : s.title }
          : s
      )
      saveHistory(id, updated)
      return updated
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  function createSession(greet = false): string {
    const newId = `${Date.now()}`
    const newSession: ChatSession = { id: newId, title: '新对话', messages: [], createdAt: Date.now() }
    setSessions(prev => {
      const updated = [newSession, ...prev]
      saveHistory(id, updated)
      return updated
    })
    setCurrentId(newId)
    setMessages([])
    setLastPresetId(null)
    if (greet) {
      pendingGreet.current = true
    }
    return newId
  }

  function loadSession(session: ChatSession) {
    setCurrentId(session.id)
    setMessages(session.messages)
    setLastPresetId(null)
  }

  const runStream = useCallback(async (msgHistory: Message[]) => {
    setIsStreaming(true)
    if (msgHistory.length === 0) setIsInitializing(true)

    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloggerId: id, messages: msgHistory }),
      })
      if (!res.ok || !res.body) throw new Error()
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: copy[copy.length - 1].content + chunk }
          return copy
        })
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: '抱歉，出了点问题，稍后再试试？' }
        return copy
      })
    } finally {
      setIsStreaming(false)
      setIsInitializing(false)
    }
  }, [id])

  const sendMessage = useCallback((text: string) => {
    if (isStreaming || !text.trim()) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const nextHistory = [...messages, userMsg]
    setMessages(nextHistory)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    runStream(nextHistory)
  }, [isStreaming, messages, runStream])

  function handlePreset(preset: typeof PRESETS[0]) {
    setLastPresetId(preset.id)
    sendMessage(preset.question)
  }

  const chipsToShow = hasUserMessages
    ? PRESETS.filter(p => p.id !== lastPresetId)
    : []

  const showPresetCards =
    messages.some(m => m.role === 'assistant') && !hasUserMessages && !isStreaming

  if (!blogger) {
    return (
      <div style={{ height: '100dvh', background: '#FFF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9B9B9B' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>⏳</div>
          <p style={{ fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#FFF8F5' }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 248,
        flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #EDE5E2',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
      }}>
        {/* Sidebar top */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #EDE5E2' }}>
          <button
            onClick={() => router.push('/explore')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9B9B9B', fontSize: 12.5, padding: '2px 0', marginBottom: 14,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="#9B9B9B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            所有博主
          </button>

          {/* Blogger mini-header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #F0E8E5', flexShrink: 0, backgroundImage: `url(${blogger.avatar})`, backgroundSize: '130%', backgroundPosition: 'center' }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1F1F1F', lineHeight: 1.2 }}>{blogger.name}</div>
              <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 1 }}>{blogger.track} · AI 分身</div>
            </div>
          </div>

          {/* Report link */}
          <a
            href={blogger.reportPath}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 10,
              background: '#FFF8F5', border: '1px solid #EDE5E2',
              color: '#1F1F1F', fontSize: 12.5, fontWeight: 600,
              textDecoration: 'none',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF2442')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#EDE5E2')}
          >
            <span style={{ fontSize: 14 }}>📊</span>
            查看完整解码报告
            <span style={{ fontSize: 11, color: '#9B9B9B', marginLeft: 'auto' }}>↗</span>
          </a>
        </div>

        {/* New chat button */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EDE5E2' }}>
          <button
            onClick={() => { createSession(true) }}
            style={{
              width: '100%', padding: '9px 0',
              borderRadius: 10, border: '1.5px dashed #EDE5E2',
              background: 'transparent', color: '#6B6B6B',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF2442'; e.currentTarget.style.color = '#FF2442' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE5E2'; e.currentTarget.style.color = '#6B6B6B' }}
          >
            <span style={{ fontSize: 15 }}>+</span> 新对话
          </button>
        </div>

        {/* Session list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
          {sessions.length === 0 && (
            <p style={{ fontSize: 12, color: '#C0B8B5', textAlign: 'center', padding: '20px 0' }}>
              暂无对话记录
            </p>
          )}
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => loadSession(s)}
              style={{
                width: '100%', padding: '9px 11px',
                borderRadius: 9, border: 'none',
                background: s.id === currentId ? '#FFF0F2' : 'transparent',
                color: s.id === currentId ? '#FF2442' : '#3D3D3D',
                fontSize: 12.5, textAlign: 'left',
                cursor: 'pointer', marginBottom: 2,
                transition: 'background 0.12s',
                display: 'flex', flexDirection: 'column', gap: 2,
              }}
              onMouseEnter={e => { if (s.id !== currentId) e.currentTarget.style.background = '#FFF8F5' }}
              onMouseLeave={e => { if (s.id !== currentId) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{
                display: 'block', fontWeight: s.id === currentId ? 700 : 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {s.title}
              </span>
              <span style={{ fontSize: 11, color: '#B0A8A8', fontWeight: 400 }}>
                {timeAgo(s.createdAt)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100dvh' }}>

        {/* Header */}
        <div style={{
          background: 'rgba(255,248,245,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #EDE5E2',
          padding: '0 20px',
          height: 58,
          display: 'flex', alignItems: 'center', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #F0E8E5', flexShrink: 0, backgroundImage: `url(${blogger.avatar})`, backgroundSize: '130%', backgroundPosition: 'center' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1F1F1F', lineHeight: 1.2 }}>
              {blogger.name}
              <span style={{
                marginLeft: 7, fontSize: 10.5, fontWeight: 600,
                background: '#FFF0F2', color: '#FF2442',
                padding: '1.5px 7px', borderRadius: 100, verticalAlign: 'middle',
              }}>
                AI 分身
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 1 }}>{blogger.track} 博主 · 基于真实笔记解码</div>
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#22C55E',
            boxShadow: '0 0 0 2.5px rgba(34,197,94,0.2)',
          }} />
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '24px 24px 8px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {isInitializing && <TypingDots avatar={blogger.avatar} />}

          {messages.map((msg, i) => (
            <Bubble key={i} msg={msg} avatar={blogger.avatar} />
          ))}

          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <TypingDots avatar={blogger.avatar} />
          )}

          {/* Full preset cards (before first user message) */}
          {showPresetCards && (
            <div style={{ paddingLeft: 44, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
              <p style={{ fontSize: 12, color: '#9B9B9B', margin: '0 0 4px' }}>可以这样开始：</p>
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePreset(p)}
                  style={{
                    padding: '11px 15px', borderRadius: 12,
                    border: '1px solid #EDE5E2', background: '#fff',
                    color: '#1F1F1F', fontSize: 13.5,
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#FF2442'
                    e.currentTarget.style.background = '#FFFAFB'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#EDE5E2'
                    e.currentTarget.style.background = '#fff'
                  }}
                >
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#FF2442',
                    background: '#FFF0F2', padding: '2px 8px', borderRadius: 6,
                    whiteSpace: 'nowrap',
                  }}>
                    {p.label}
                  </span>
                  <span style={{ color: '#3D3D3D', lineHeight: 1.5 }}>{p.question}</span>
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Preset chips row */}
        {chipsToShow.length > 0 && (
          <div style={{
            padding: '8px 20px 0',
            display: 'flex', gap: 7, flexWrap: 'wrap',
            borderTop: '1px solid #EDE5E2',
            background: 'rgba(255,248,245,0.97)',
          }}>
            {chipsToShow.map(p => (
              <button
                key={p.id}
                onClick={() => handlePreset(p)}
                disabled={isStreaming}
                style={{
                  padding: '5px 13px',
                  borderRadius: 100,
                  border: '1px solid #EDE5E2',
                  background: '#fff',
                  color: '#3D3D3D', fontSize: 12.5, fontWeight: 600,
                  cursor: isStreaming ? 'not-allowed' : 'pointer',
                  opacity: isStreaming ? 0.5 : 1,
                  transition: 'all 0.14s',
                }}
                onMouseEnter={e => { if (!isStreaming) { e.currentTarget.style.borderColor = '#FF2442'; e.currentTarget.style.color = '#FF2442' } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE5E2'; e.currentTarget.style.color = '#3D3D3D' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div style={{
          flexShrink: 0,
          padding: '10px 20px 18px',
          background: 'rgba(255,248,245,0.98)',
          backdropFilter: 'blur(12px)',
        }}>
          <div
            style={{
              display: 'flex', gap: 10, alignItems: 'flex-end',
              background: '#fff',
              border: '1.5px solid #EDE5E2',
              borderRadius: 16,
              padding: '10px 10px 10px 16px',
              transition: 'border-color 0.15s',
            }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = '#FF2442')}
            onBlurCapture={e => (e.currentTarget.style.borderColor = '#EDE5E2')}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(input)
                }
              }}
              placeholder={`问问 ${blogger.name} 的创作经验...`}
              disabled={isStreaming}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: 'none', outline: 'none',
                background: 'transparent', fontSize: 14, color: '#1F1F1F',
                lineHeight: 1.65, fontFamily: 'inherit',
                maxHeight: 120, overflow: 'auto',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isStreaming || !input.trim()}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                border: 'none',
                background: isStreaming || !input.trim() ? '#F0E8E5' : '#FF2442',
                color: isStreaming || !input.trim() ? '#B0A8A8' : '#fff',
                cursor: isStreaming || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'background 0.15s',
              }}
            >
              ↑
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#C0B8B5', margin: '7px 0 0' }}>
            AI 分身基于真实笔记解码 · Enter 发送 · Shift+Enter 换行
          </p>
        </div>
      </div>
    </div>
  )
}
