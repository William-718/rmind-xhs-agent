'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const TRACKS = ['全部', '美妆', '时尚', '生活', '美食', '家居']

const TRACK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  美妆: { bg: '#FFF0F2', text: '#FF2442', border: '#FFB3BF' },
  时尚: { bg: '#F5F0FF', text: '#7C3AED', border: '#C4B5FD' },
  生活: { bg: '#F0FFF4', text: '#059669', border: '#6EE7B7' },
  美食: { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' },
  家居: { bg: '#F0F9FF', text: '#0284C7', border: '#7DD3FC' },
}

const BLOGGERS = [
  {
    id: 'jijiyaya',
    name: '美妆行业顾问',
    track: '美妆',
    emoji: '💄',
    tagline: '基于美妆赛道头部内容的系统研究，帮你建立有立场、可复制的美妆内容方法论',
    stats: [
      { label: '研究样本', value: '30 条笔记' },
      { label: '分析维度', value: '10 项' },
      { label: '爆款公式', value: '3 套' },
    ],
    highlight: '揭露类 / 护肤教程 / 里程碑内容均可实现高爆款率，三赛道规律已系统提炼',
    topNote: '「好内容不是精心包装出来的，是真实经历堆出来的」',
  },
  {
    id: 'tansuanbaibai',
    name: '时尚行业顾问',
    track: '时尚',
    emoji: '👗',
    tagline: '深度解析时尚赛道的在场感内容逻辑，用松弛视角打造可望可及的穿搭方法论',
    stats: [
      { label: '研究样本', value: '39 条笔记' },
      { label: '分析维度', value: '10 项' },
      { label: '爆款公式', value: '3 套' },
    ],
    highlight: '稀缺场景内容均赞是日常穿搭的 3 倍，在场感内容策略已系统提炼',
    topNote: '「真正的松弛感是一种状态，不是一种技巧」',
  },
  {
    id: 'yemangzheng',
    name: '生活行业顾问',
    track: '生活',
    emoji: '🌿',
    tagline: '聚焦长期主义生活视角，帮你在低频更新中建立高信任度的内容人格',
    stats: [
      { label: '研究样本', value: '20 条笔记' },
      { label: '分析维度', value: '10 项' },
      { label: '爆款公式', value: '3 套' },
    ],
    highlight: '低频精品策略验证：减少更新频率、提高内容密度可显著提升藏赞比',
    topNote: '「长期主义不是慢，是每一条都值得被收藏」',
  },
  {
    id: 'layuexiaojiu',
    name: '美食行业顾问',
    track: '美食',
    emoji: '🍜',
    tagline: '用情感叙事重新定义美食内容，帮你找到食物背后打动人的真实表达',
    stats: [
      { label: '研究样本', value: '30 条笔记' },
      { label: '分析维度', value: '10 项' },
      { label: '爆款公式', value: '3 套' },
    ],
    highlight: '情感钩子型美食内容藏赞比远超纯教程内容，家庭叙事系列规律已提炼',
    topNote: '「做饭的意义不是食物，是食物背后的那个人」',
  },
  {
    id: 'muzilan',
    name: '家居行业顾问',
    track: '家居',
    emoji: '🏠',
    tagline: '以懒人思维重构家居装修内容逻辑，帮你生产高收藏、强复购的实用干货',
    stats: [
      { label: '研究样本', value: '29 条笔记' },
      { label: '分析维度', value: '10 项' },
      { label: '爆款公式', value: '3 套' },
    ],
    highlight: '工具型内容藏赞比可达 130%+，"来抄作业"式表达是激活收藏的核心机制',
    topNote: '「懒不是借口，懒是设计创新最真实的驱动力」',
  },
]

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#1F1F1F', color: '#fff', padding: '10px 22px',
      borderRadius: 10, fontSize: 14, zIndex: 9999,
      pointerEvents: 'none', whiteSpace: 'nowrap',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      {msg}
    </div>
  )
}

const DECODE_STEPS = [
  { at: 0,  text: '正在访问博主主页，收集基础数据…' },
  { at: 12, text: '正在抓取近期笔记内容，分析发布规律…' },
  { at: 28, text: '正在解析爆款选题与标题公式…' },
  { at: 48, text: '正在提取创作DNA与人设特征…' },
  { at: 68, text: '正在计算数据特征与藏赞比模型…' },
  { at: 85, text: '正在生成解码报告，即将完成…' },
]

export default function ExplorePage() {
  const router = useRouter()
  const [activeTrack, setActiveTrack] = useState('全部')
  const [customInput, setCustomInput] = useState('')
  const [toast, setToast] = useState('')
  const [showDecodeModal, setShowDecodeModal] = useState(false)
  const [decodeUrl, setDecodeUrl] = useState('')
  const [decodeProgress, setDecodeProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!showDecodeModal) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDecodeProgress(0)
      return
    }
    const DURATION = 30 * 60 * 1000
    const TICK = 1000
    const step = 100 / (DURATION / TICK)
    intervalRef.current = setInterval(() => {
      setDecodeProgress(p => {
        if (p + step >= 100) {
          clearInterval(intervalRef.current!)
          return 99.9
        }
        return p + step
      })
    }, TICK)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [showDecodeModal])

  const filtered = activeTrack === '全部'
    ? BLOGGERS
    : BLOGGERS.filter(b => b.track === activeTrack)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }

  function handleDecode() {
    const url = customInput.trim()
    if (!url) { showToast('请先输入博主主页链接'); return }
    setDecodeUrl(url)
    setDecodeProgress(0)
    setShowDecodeModal(true)
  }

  const currentStep = [...DECODE_STEPS].reverse().find(s => decodeProgress >= s.at) ?? DECODE_STEPS[0]
  const minutesLeft = Math.ceil((100 - decodeProgress) / 100 * 30)

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8F5' }}>
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* ── Decode Progress Modal ── */}
      {showDecodeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: '40px 36px',
            maxWidth: 480, width: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>🔍</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1F1F1F' }}>正在解码博主数据</div>
                <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 2 }}>预计耗时 30 分钟，请耐心等待</div>
              </div>
            </div>

            {/* URL tag */}
            <div style={{
              background: '#F7F7F7', borderRadius: 8, padding: '8px 12px',
              fontSize: 12, color: '#6B6B6B', marginBottom: 24,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              🔗 {decodeUrl}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                height: 8, background: '#F0E8E5', borderRadius: 99, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, #FF2442 0%, #FF8C9A 100%)',
                  width: `${decodeProgress}%`,
                  transition: 'width 1s linear',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#9B9B9B' }}>{decodeProgress.toFixed(1)}%</span>
                <span style={{ fontSize: 11, color: '#9B9B9B' }}>剩余约 {minutesLeft} 分钟</span>
              </div>
            </div>

            {/* Status text */}
            <div style={{
              fontSize: 13, color: '#3D3D3D', lineHeight: 1.6,
              background: '#FFF8F5', borderRadius: 10, padding: '12px 14px',
              marginBottom: 24, minHeight: 44,
            }}>
              {currentStep.text}
            </div>

            {/* Note */}
            <p style={{ fontSize: 12, color: '#B0A8A8', margin: '0 0 20px', lineHeight: 1.6 }}>
              数据收集完成后，我们会为你生成完整的博主解码报告，包括人设定位、爆款公式、内容 DNA 等维度。
            </p>

            <button
              onClick={() => setShowDecodeModal(false)}
              style={{
                width: '100%', padding: '11px 0', borderRadius: 10,
                border: '1.5px solid #EDE5E2', background: '#fff',
                color: '#6B6B6B', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              }}
            >
              关闭（后台继续运行）
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,248,245,0.97)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #EDE5E2',
        padding: '0 32px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={() => router.push('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B6B6B', fontSize: 13, padding: '4px 0',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回首页
        </button>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1F1F1F', letterSpacing: '-0.01em' }}>
          薯脑<span style={{ color: '#FF2442' }}>Rmind</span>
        </div>
        <div style={{ width: 72 }} />
      </nav>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 28px 96px' }}>

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#FFF0F2', color: '#FF2442',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
            padding: '4px 12px', borderRadius: 20, marginBottom: 16,
            textTransform: 'uppercase',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2442', display: 'inline-block' }} />
            选择你的对标博主
          </div>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 38px)',
            fontWeight: 800, color: '#1F1F1F',
            lineHeight: 1.25, margin: '0 0 12px',
            letterSpacing: '-0.02em',
          }}>
            把值得学习的<span style={{ color: '#FF2442' }}>爆款博主</span>，变成你的随身顾问
          </h1>
          <p style={{ fontSize: 14.5, color: '#6B6B6B', margin: 0, lineHeight: 1.65 }}>
            选择一个行业顾问，获取专属定位 · 选题 · 笔记诊断建议
          </p>
        </div>

        {/* ── 想对标其他博主 (light style) ── */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          border: '1.5px solid #EDE5E2',
          padding: '24px 28px',
          marginBottom: 36,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Red accent bar at top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, #FF2442 0%, #FF8C9A 100%)',
            borderRadius: '20px 20px 0 0',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>🔍</span>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1F1F1F', margin: 0 }}>
                  想找自己的<span style={{ color: '#FF2442' }}>对标博主</span>？
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#6B6B6B', margin: 0, lineHeight: 1.6 }}>
                输入 Ta 的主页链接或 ID，我们为你解码 Ta 的爆款密码
              </p>
            </div>

            <div style={{ flex: '1 1 380px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDecode()}
                placeholder="粘贴小红书主页链接或输入博主 ID..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #EDE5E2',
                  background: '#FAFAFA',
                  color: '#1F1F1F',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = '#FF2442')}
                onBlur={e => (e.target.style.borderColor = '#EDE5E2')}
              />
              <button
                onClick={handleDecode}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#FF2442',
                  color: '#fff',
                  fontSize: 13.5, fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#E0001F')}
                onMouseLeave={e => (e.currentTarget.style.background = '#FF2442')}
              >
                立即解码
              </button>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: '#B0A8A8', margin: '12px 0 0' }}>
            🔒 点击「立即解码」后，系统将自动收集数据 · 根据数据量预计需要 15–30 分钟
          </p>
        </div>

        {/* Track Tabs */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: 32,
        }}>
          {TRACKS.map(track => {
            const isActive = activeTrack === track
            const color = track !== '全部' ? TRACK_COLORS[track] : null
            return (
              <button
                key={track}
                onClick={() => setActiveTrack(track)}
                style={{
                  padding: '7px 20px',
                  borderRadius: 100,
                  border: isActive
                    ? `1.5px solid ${color ? color.border : '#FF2442'}`
                    : '1.5px solid #EDE5E2',
                  background: isActive
                    ? (color ? color.bg : '#FFF0F2')
                    : '#fff',
                  color: isActive
                    ? (color ? color.text : '#FF2442')
                    : '#6B6B6B',
                  fontSize: 13.5, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.16s ease',
                }}
              >
                {track}
                {track !== '全部' && (
                  <span style={{ marginLeft: 5, fontSize: 11, opacity: 0.55, fontWeight: 400 }}>
                    {BLOGGERS.filter(b => b.track === track).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Blogger Cards — 3 per row, last row centered */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 24,
          maxWidth: 1064,
          margin: '0 auto',
        }}>
          {filtered.map(blogger => {
            const trackColor = TRACK_COLORS[blogger.track]
            return (
              <div
                key={blogger.id}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  border: '1.5px solid #EDE5E2',
                  padding: '24px 24px 20px',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  flex: '0 0 calc((100% - 48px) / 3)',
                  maxWidth: 340,
                  minWidth: 280,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = '1.5px solid #FF2442'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 10px 32px rgba(255,36,66,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1.5px solid #EDE5E2'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)'
                }}
              >
                {/* Emoji Icon + Name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${trackColor.border}`,
                    background: trackColor.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                  }}>
                    {blogger.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#1F1F1F', letterSpacing: '-0.01em' }}>
                        {blogger.name}
                      </span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 100, whiteSpace: 'nowrap', flexShrink: 0,
                        background: trackColor.bg, color: trackColor.text,
                        border: `1px solid ${trackColor.border}`,
                        letterSpacing: '0.03em',
                      }}>
                        {blogger.track}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 12, color: '#6B6B6B', margin: 0, lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {blogger.tagline}
                    </p>
                  </div>
                </div>

                {/* Stats — 3 cells from real SKILL.md data */}
                <div style={{
                  display: 'flex', background: '#FAF6F4',
                  borderRadius: 12, overflow: 'hidden', marginBottom: 14,
                  border: '1px solid #F0E8E5',
                }}>
                  {blogger.stats.map((s, i) => (
                    <div key={s.label} style={{
                      flex: 1, padding: '9px 0', textAlign: 'center',
                      borderRight: i < blogger.stats.length - 1 ? '1px solid #F0E8E5' : 'none',
                    }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#FF2442', lineHeight: 1.2 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: '#9B9B9B', marginTop: 3, letterSpacing: '0.02em' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Highlight */}
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 7,
                  background: '#FFFBF0', border: '1px solid #FFE9A0',
                  borderRadius: 9, padding: '8px 11px', marginBottom: 14,
                }}>
                  <span style={{ fontSize: 12, flexShrink: 0, marginTop: 1 }}>⚡️</span>
                  <span style={{ fontSize: 12, color: '#7A5200', lineHeight: 1.55 }}>{blogger.highlight}</span>
                </div>

                {/* Top Note */}
                <div style={{
                  borderLeft: '2.5px solid #FF2442', paddingLeft: 11, marginBottom: 18, flex: 1,
                }}>
                  <div style={{
                    fontSize: 10, color: '#B0A0A0', marginBottom: 3,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    研究精华 · 行业金句
                  </div>
                  <p style={{ fontSize: 12.5, color: '#1F1F1F', margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>
                    {blogger.topNote}
                  </p>
                </div>

                {/* Two CTA buttons */}
                <div style={{ display: 'flex', gap: 9 }}>
                  <button
                    onClick={() => router.push(`/blogger/${blogger.id}`)}
                    style={{
                      flex: 1, padding: '10px 0',
                      borderRadius: 10,
                      border: '1.5px solid #EDE5E2',
                      background: '#fff',
                      color: '#1F1F1F', fontSize: 12.5, fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1F1F1F')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#EDE5E2')}
                  >
                    查看解码报告
                  </button>
                  <button
                    onClick={() => router.push(`/chat/${blogger.id}`)}
                    style={{
                      flex: 1, padding: '10px 0',
                      borderRadius: 10,
                      border: 'none',
                      background: '#FF2442',
                      color: '#fff', fontSize: 12.5, fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#E0001F')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FF2442')}
                  >
                    和 TA 聊聊
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9B9B9B' }}>
            <div style={{ fontSize: 38, marginBottom: 14 }}>🔍</div>
            <p style={{ fontSize: 15 }}>该品类暂无收录博主</p>
          </div>
        )}

        {/* Bottom note */}
        <div style={{
          textAlign: 'center', marginTop: 52,
          padding: '20px 28px',
          background: '#fff',
          border: '1px solid #EDE5E2',
          borderRadius: 14,
          maxWidth: 500, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 5px' }}>
            📌 每位博主均经过 <span style={{ color: '#FF2442', fontWeight: 700 }}>多模态采集 + LLM 结构化解码</span> 完整分析
          </p>
          <p style={{ fontSize: 11.5, color: '#9B9B9B', margin: 0 }}>
            数据来源：博主公开笔记 · 所有统计数字均有原始笔记出处
          </p>
        </div>
      </div>
    </div>
  )
}
