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
    name: '叽叽亚亚',
    track: '美妆',
    avatar: '/avatars/jijiyaya.jpg',
    tagline: '揭露派美妆博主，替你踩过所有坑，才开口说真实话',
    stats: [
      { label: '粉丝数', value: '79.2万' },
      { label: '均赞', value: '21,422' },
      { label: '藏赞比', value: '36.1%' },
    ],
    sample: '30 条笔记',
    highlight: '揭露类内容跨美妆 / 医美 / 护肤三赛道均爆款',
    topNote: '作为口红博主，我居然被种草一堆冷门口红？',
  },
  {
    id: 'tansuanbaibai',
    name: '碳酸饮料拜拜',
    track: '时尚',
    avatar: '/avatars/tansuanbaibai.jpg',
    tagline: '在场就是内容，用真实松弛感传递时尚的可望可及性',
    stats: [
      { label: '粉丝数', value: '141.9万' },
      { label: '均赞', value: '19,520' },
      { label: '收藏率', value: '6.9%' },
    ],
    sample: '39 条笔记',
    highlight: '时装周系列均赞 22,340，是日常穿搭内容的 3 倍',
    topNote: 'pov：当你觉得自己穿的很松弛来到巴黎',
  },
  {
    id: 'yemangzheng',
    name: '夜忙症',
    track: '生活',
    avatar: '/avatars/yemangzheng.jpg',
    tagline: '有品位的真实主义者，用长期主义视角看消费、感情和人生',
    stats: [
      { label: '粉丝数', value: '90.5万' },
      { label: '均赞', value: '851' },
      { label: '更新节奏', value: '36.4天/篇' },
    ],
    sample: '20 条笔记',
    highlight: '低频精品策略，女性成长系列均赞 1,068，珠宝科普藏赞比极高',
    topNote: '婚姻关系中最重要的到底是什么❓婚前坦白局',
  },
  {
    id: 'layuexiaojiu',
    name: '腊月小九',
    track: '美食',
    avatar: '/avatars/layuexiaojiu.jpg',
    tagline: '一个普通妈妈用食物丈量孩子成长的时间',
    stats: [
      { label: '粉丝数', value: '523.6万' },
      { label: '均赞', value: '27,909' },
      { label: '藏赞比', value: '14.9%' },
    ],
    sample: '30 条笔记',
    highlight: '均藏 4,167，儿子归家系列情感密度最强，月更仍保持 TOP 级数据',
    topNote: '只有孩子回家才想好好做饭！',
  },
  {
    id: 'muzilan',
    name: '木梓蓝🏠',
    track: '家居',
    avatar: '/avatars/muzilan.jpg',
    tagline: '用极致懒人思维对抗传统装修惯性，让每个设计决策减少重复劳动',
    stats: [
      { label: '粉丝数', value: '51.8万' },
      { label: '均赞', value: '3,903' },
      { label: '藏赞比', value: '66.6%' },
    ],
    sample: '29 条笔记',
    highlight: 'TOP4 藏赞比高达 134.9%，内容被粉丝当装修参考手册反复查阅',
    topNote: '适女化懒人设计！按女生需求设计的家有多爽？',
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
            选择一位博主，与 TA 的 AI 分身深度对话，获取专属定位 · 选题 · 诊断建议
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
                {/* Avatar + Name */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                    border: '2px solid #F0E8E5',
                    backgroundImage: `url(${blogger.avatar})`,
                    backgroundSize: '130%',
                    backgroundPosition: 'center',
                  }} />
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
                    代表爆款 · 样本 {blogger.sample}
                  </div>
                  <p style={{ fontSize: 12.5, color: '#1F1F1F', margin: 0, lineHeight: 1.55, fontStyle: 'italic' }}>
                    「{blogger.topNote}」
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
