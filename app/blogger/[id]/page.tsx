'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// ── Types ─────────────────────────────────────────────────────────────────────

interface DnaSection {
  summary: string
  details: string[]
}

interface Blogger {
  id: string
  name: string
  track: string
  avatar: string
  tagline: string
  stats: { fans: string; avgLikes: string; hotLabel?: string; hotRate: string; formula: string }
  dna: {
    positioning: DnaSection
    beliefs: DnaSection
    topics: DnaSection
    formula: DnaSection
    rhythm: DnaSection
    forbidden: DnaSection
  }
  topNotes: string[]
  reportPath: string
  status: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TRACK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  美妆: { bg: '#FFF0F2', text: '#FF2442', border: '#FFB3BF' },
  时尚: { bg: '#F5F0FF', text: '#7C3AED', border: '#C4B5FD' },
  生活: { bg: '#F0FFF4', text: '#059669', border: '#6EE7B7' },
  美食: { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' },
  家居: { bg: '#F0F9FF', text: '#0284C7', border: '#7DD3FC' },
}

const DNA_META: Record<string, { label: string; icon: string; accent: string }> = {
  positioning: { label: '人设定位', icon: '🎯', accent: '#FF2442' },
  beliefs:     { label: '内容信仰', icon: '💡', accent: '#7C3AED' },
  topics:      { label: '选题策略', icon: '📝', accent: '#059669' },
  formula:     { label: '标题公式', icon: '✍️', accent: '#D97706' },
  rhythm:      { label: '更新节奏', icon: '🕐', accent: '#0284C7' },
  forbidden:   { label: '禁区边界', icon: '🚫', accent: '#6B6B6B' },
}

// ── DNA Card ──────────────────────────────────────────────────────────────────

function DnaCard({
  id,
  section,
}: {
  id: string
  section: DnaSection
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = DNA_META[id]

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid #F0E8E5',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '20px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', gap: 14,
          textAlign: 'left',
        }}
      >
        <span style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: meta.accent + '14',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}>
          {meta.icon}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
            color: meta.accent, marginBottom: 5,
          }}>
            {meta.label}
          </div>
          <p style={{ fontSize: 14, color: '#1F1F1F', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
            {section.summary}
          </p>
        </div>
        <span style={{
          fontSize: 18, color: '#9B9B9B', flexShrink: 0,
          marginTop: 8, lineHeight: 1,
          transform: expanded ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s ease',
        }}>
          ↓
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          padding: '0 24px 20px',
          borderTop: '1px solid #F0E8E5',
          paddingTop: 16,
        }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {section.details.map((detail, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: meta.accent + '18',
                  color: meta.accent, fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: '#3D3D3D', lineHeight: 1.65 }}>
                  {detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── TOP10 Drawer ──────────────────────────────────────────────────────────────

function Top10Drawer({
  notes,
  bloggerName,
  onClose,
}: {
  notes: string[]
  bloggerName: string
  onClose: () => void
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 200, backdropFilter: 'blur(4px)',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', zIndex: 201,
        borderRadius: '20px 20px 0 0',
        padding: '24px 24px 48px',
        maxHeight: '75vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 2, background: '#E5E5E5',
          margin: '0 auto 24px',
        }} />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F1F1F', margin: '0 0 20px' }}>
          {bloggerName} · TOP 10 爆款笔记
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notes.map((note, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '14px 16px',
              background: i === 0 ? '#FFF0F2' : '#FFF8F5',
              borderRadius: 12,
              border: i === 0 ? '1px solid #FFB3BF' : '1px solid #F0E8E5',
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                background: i < 3 ? '#FF2442' : '#E5E5E5',
                color: i < 3 ? '#fff' : '#9B9B9B',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, color: '#1F1F1F', lineHeight: 1.55 }}>
                {note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BloggerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [blogger, setBlogger] = useState<Blogger | null>(null)
  const [showTop10, setShowTop10] = useState(false)
  const [chatHovered, setChatHovered] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch('/api/bloggers')
      .then(r => r.json())
      .then((data: Blogger[]) => {
        const found = data.find(b => b.id === id)
        if (!found) router.push('/explore')
        else setBlogger(found)
      })
      .catch(() => router.push('/explore'))
  }, [id, router])

  if (!blogger) {
    return (
      <div style={{ minHeight: '100vh', background: '#FFF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#9B9B9B' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ fontSize: 14 }}>加载中...</p>
        </div>
      </div>
    )
  }

  const trackColor = TRACK_COLORS[blogger.track] ?? TRACK_COLORS['美妆']

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F5', zoom: 1.45 }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,248,245,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0E8E5',
        padding: '0 24px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => router.push('/explore')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B6B6B', fontSize: 14, padding: '4px 0',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          所有博主
        </button>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1F1F1F' }}>
          薯脑<span style={{ color: '#FF2442' }}>Rmind</span>
        </div>
        <div style={{ width: 64 }} />
      </nav>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 120px' }}>

        {/* Hero Card */}
        <div style={{
          background: '#fff',
          border: '1.5px solid #F0E8E5',
          borderRadius: 24,
          padding: '32px 32px 28px',
          marginBottom: 24,
        }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%', flexShrink: 0,
              border: '2.5px solid #F0E8E5',
              backgroundImage: `url(${blogger.avatar})`,
              backgroundSize: '130%',
              backgroundPosition: 'center',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1F1F1F', margin: 0, lineHeight: 1.2 }}>
                  {blogger.name}
                </h1>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 100,
                  background: trackColor.bg, color: trackColor.text, border: `1px solid ${trackColor.border}`,
                }}>
                  {blogger.track}
                </span>
              </div>
              <p style={{ fontSize: 14, color: '#6B6B6B', margin: '0 0 16px', lineHeight: 1.6 }}>
                {blogger.tagline}
              </p>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { label: '粉丝数', value: blogger.stats.fans },
                  { label: '均赞', value: blogger.stats.avgLikes },
                  { label: blogger.stats.hotLabel || '数据特征', value: blogger.stats.hotRate },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 11, color: '#9B9B9B', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#FF2442' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formula strip */}
          <div style={{
            background: '#FFF8F5', border: '1px solid #F0E8E5',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: 13, color: '#FF2442', fontWeight: 700, whiteSpace: 'nowrap', marginTop: 1 }}>
              爆款公式
            </span>
            <span style={{ fontSize: 13, color: '#3D3D3D', lineHeight: 1.6 }}>
              {blogger.stats.formula}
            </span>
          </div>
        </div>

        {/* Section: DNA */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              color: '#9B9B9B', textTransform: 'uppercase',
            }}>
              博主 DNA · 6 维度解码
            </div>
            <div style={{ flex: 1, height: 1, background: '#F0E8E5' }} />
            <div style={{ fontSize: 12, color: '#9B9B9B' }}>点击展开详情</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(blogger.dna).map(([key, section]) => (
              <DnaCard key={key} id={key} section={section as DnaSection} />
            ))}
          </div>
        </div>

        {/* TOP10 + Report row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => setShowTop10(true)}
            style={{
              flex: 1, padding: '14px 0',
              borderRadius: 14,
              border: '1.5px solid #F0E8E5',
              background: '#fff',
              color: '#1F1F1F', fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
              transition: 'border-color 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF2442')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#F0E8E5')}
          >
            🏆 TOP 10 爆款笔记
          </button>
          <a
            href={blogger.reportPath}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '14px 0',
              borderRadius: 14,
              border: '1.5px solid #F0E8E5',
              background: '#fff',
              color: '#1F1F1F', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.18s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF2442')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#F0E8E5')}
          >
            📊 查看完整解码报告
          </a>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 24px 24px',
        background: 'linear-gradient(to top, #FFF8F5 60%, transparent)',
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <button
            onClick={() => router.push(`/chat/${blogger.id}`)}
            onMouseEnter={() => setChatHovered(true)}
            onMouseLeave={() => setChatHovered(false)}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: 16,
              border: 'none',
              background: chatHovered
                ? '#E0001F'
                : 'linear-gradient(135deg, #FF2442 0%, #FF6B7A 100%)',
              color: '#fff',
              fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: chatHovered
                ? '0 6px 24px rgba(255,36,66,0.45)'
                : '0 4px 16px rgba(255,36,66,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            与 {blogger.name} 的 AI 分身对话 →
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9B9B9B', margin: '8px 0 0' }}>
            基于真实笔记数据解码，获取专属定位 / 选题 / 诊断建议
          </p>
        </div>
      </div>

      {/* TOP10 Drawer */}
      {showTop10 && (
        <Top10Drawer
          notes={blogger.topNotes}
          bloggerName={blogger.name}
          onClose={() => setShowTop10(false)}
        />
      )}
    </div>
  )
}
