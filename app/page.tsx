'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      background: '#1F1F1F', color: '#fff', padding: '10px 20px',
      borderRadius: 8, fontSize: 14, zIndex: 9999,
      pointerEvents: 'none', whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  )
}

// ── Highlighted text helper ───────────────────────────────────────────────────

function R({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#FF2442', fontWeight: 500 }}>{children}</span>
}

// ── Stat Item ─────────────────────────────────────────────────────────────────

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 36px' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#FF2442', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {number}
      </div>
      <div style={{ fontSize: 12, color: '#9B9B9B', marginTop: 6, letterSpacing: '0.03em' }}>{label}</div>
    </div>
  )
}

// ── Why Card ──────────────────────────────────────────────────────────────────

function WhyCard({
  icon,
  label,
  quotes,
}: {
  icon: React.ReactNode
  label: string
  quotes: Array<{ text: React.ReactNode; author: string }>
}) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #F0E8E5', borderRadius: 16,
      padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottom: '0.5px solid #F0E8E5' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: '#FFE4E6',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{icon}</div>
        <span style={{ fontSize: 16, fontWeight: 500, color: '#1F1F1F' }}>{label}</span>
      </div>
      {quotes.map((q, i) => (
        <div key={i}>
          <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.8, fontStyle: 'italic', margin: '0 0 6px' }}>
            「{q.text}」
          </p>
          <span style={{ fontSize: 12, color: '#9B9B9B' }}>{q.author}</span>
        </div>
      ))}
    </div>
  )
}

// ── Goal Card ─────────────────────────────────────────────────────────────────

function GoalCard({ icon, title, desc }: { icon: React.ReactNode; title: React.ReactNode; desc: React.ReactNode }) {
  return (
    <div style={{ background: '#FFF8F5', border: '0.5px solid #F0E8E5', borderRadius: 12, padding: '32px 28px' }}>
      <div style={{ marginBottom: 16 }}>{icon}</div>
      <h4 style={{ fontSize: 18, fontWeight: 500, color: '#1F1F1F', marginBottom: 12 }}>{title}</h4>
      <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.8, margin: 0 }}>{desc}</p>
    </div>
  )
}

// ── Flow Chart ────────────────────────────────────────────────────────────────

function FlowChart({ steps, highlightLast }: { steps: string[]; highlightLast?: boolean }) {
  return (
    <div style={{
      background: '#FFF8F5', border: '0.5px solid #F0E8E5',
      borderRadius: 12, padding: '24px 20px',
    }}>
      {steps.map((s, i) => (
        <div key={i}>
          <div style={{
            background: '#fff',
            border: `0.5px solid ${highlightLast && i === steps.length - 1 ? '#FF2442' : '#F0E8E5'}`,
            borderRadius: 8, padding: '10px 16px', fontSize: 13, textAlign: 'center',
            color: highlightLast && i === steps.length - 1 ? '#FF2442' : '#1F1F1F',
            fontWeight: highlightLast && i === steps.length - 1 ? 500 : 400,
          }}>{s}</div>
          {i < steps.length - 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '5px 0', color: '#9B9B9B' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M8 14l-4-4M8 14l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Quadrant Chart ────────────────────────────────────────────────────────────

function QuadrantChart() {
  const W = 520, H = 400, pad = 72, cx = W / 2, cy = H / 2
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
      <line x1={pad} y1={cy} x2={W - pad} y2={cy} stroke="#F0E8E5" strokeWidth={1} />
      <line x1={cx} y1={pad} x2={cx} y2={H - pad} stroke="#F0E8E5" strokeWidth={1} />
      <text x={pad + 4} y={cy - 10} fontSize={11} fill="#9B9B9B">数据导向</text>
      <text x={W - pad - 4} y={cy - 10} fontSize={11} fill="#9B9B9B" textAnchor="end">对话导向</text>
      <text x={cx} y={pad + 14} fontSize={11} fill="#9B9B9B" textAnchor="middle">个性化定制</text>
      <text x={cx} y={H - pad - 8} fontSize={11} fill="#9B9B9B" textAnchor="middle">通用方法论</text>
      <text x={pad + 12} y={cy + 30} fontSize={11} fill="#6B6B6B">新红 / 千瓜数据 / 灰豚数据</text>
      <text x={pad + 12} y={cy + 46} fontSize={10} fill="#9B9B9B">提供博主数据报表，用户自己解读</text>
      <text x={pad + 12} y={cy - 38} fontSize={11} fill="#6B6B6B">蝉小红</text>
      <text x={pad + 12} y={cy - 23} fontSize={10} fill="#9B9B9B">定制分析报告，但仍是静态数据</text>
      <text x={W - pad - 12} y={cy + 30} fontSize={11} fill="#6B6B6B" textAnchor="end">ChatGPT / 通用 AI</text>
      <text x={W - pad - 12} y={cy + 46} fontSize={10} fill="#9B9B9B" textAnchor="end">能对话，但不了解小红书生态</text>
      <circle cx={W - pad - 52} cy={cy - 72} r={22} fill="#FF2442" opacity={0.1} />
      <circle cx={W - pad - 52} cy={cy - 72} r={6} fill="#FF2442" />
      <text x={W - pad - 52} y={cy - 86} fontSize={14} fill="#FF2442" fontWeight="500" textAnchor="middle">薯脑Rmind</text>
    </svg>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconOverlap() {
  return <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><circle cx="12" cy="16" r="9" stroke="#FF2442" strokeWidth="1.5" /><circle cx="20" cy="16" r="9" stroke="#FF2442" strokeWidth="1.5" opacity="0.5" /></svg>
}
function IconTarget() {
  return <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" stroke="#FF2442" strokeWidth="1.5" /><circle cx="16" cy="16" r="7" stroke="#FF2442" strokeWidth="1.5" opacity="0.6" /><circle cx="16" cy="16" r="3" fill="#FF2442" opacity="0.8" /></svg>
}
function IconPerson() {
  return <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="11" r="4.5" stroke="#FF2442" strokeWidth="1.5" /><path d="M7 26c0-5 4-8 9-8s9 3 9 8" stroke="#FF2442" strokeWidth="1.5" strokeLinecap="round" /><path d="M25 18l3 3-3 3" stroke="#FF2442" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ children, bg = '#fff', style = {} }: {
  children: React.ReactNode; bg?: string; style?: React.CSSProperties
}) {
  return (
    <section style={{
      padding: '96px 24px', background: bg,
      borderTop: '0.5px solid #F0E8E5', ...style,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </section>
  )
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: sub ? 52 : 56 }}>
      <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 500, color: '#1F1F1F', marginBottom: sub ? 12 : 0 }}>
        {children}
      </h2>
      {sub && <p style={{ fontSize: 16, color: '#9B9B9B', maxWidth: 560, margin: '0 auto' }}>{sub}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter()
  const [toast, setToast] = useState<string | null>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string) => setToast(msg), [])

  function scrollToContent() {
    bgRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ background: '#FFF8F5', minHeight: '100vh' }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 54,
        background: 'rgba(255,248,245,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '0.5px solid #F0E8E5',
      }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: '#1F1F1F', letterSpacing: '0.01em' }}>
          薯脑<span style={{ color: '#FF2442' }}>Rmind</span>
        </span>
        <button
          onClick={() => showToast('功能开发中')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9B9B9B' }}
        >我的解码记录</button>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px 60px', textAlign: 'center', position: 'relative',
        background: 'linear-gradient(180deg, #FFF8F5 0%, #FFFFFF 100%)',
      }}>

        {/* badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#FFE4E6', borderRadius: 20, padding: '5px 14px',
          fontSize: 11.5, color: '#FF2442', marginBottom: 24, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF2442', display: 'inline-block' }} />
          小红书内容创作 AI 工具
        </div>

        {/* Product name — small */}
        <p style={{
          fontSize: 15, fontWeight: 700, color: '#FF2442',
          letterSpacing: '0.04em', marginBottom: 20,
        }}>
          薯脑Rmind
        </p>

        {/* Slogan — main hero heading */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 58px)', fontWeight: 800,
          color: '#1F1F1F', marginBottom: 28,
          letterSpacing: '-0.025em', lineHeight: 1.18,
        }}>
          把值得学习的爆款博主<br />
          变成你的<span style={{ color: '#FF2442' }}>随身顾问</span>
        </h1>

        {/* Tech tagline — bold, red keywords per term */}
        <p style={{
          fontSize: 13.5, fontWeight: 700, color: '#3D3D3D',
          marginBottom: 44, letterSpacing: '0.06em',
          lineHeight: 1.8,
        }}>
          <span style={{ color: '#FF2442' }}>多模态</span>数据收集
          <span style={{ color: '#9B9B9B', fontWeight: 400, margin: '0 10px' }}>+</span>
          LLM <span style={{ color: '#FF2442' }}>结构化</span>解码
          <span style={{ color: '#9B9B9B', fontWeight: 400, margin: '0 10px' }}>+</span>
          Prompt Engineering <span style={{ color: '#FF2442' }}>迭代</span>
        </p>

        {/* Stats — no outer border */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          flexWrap: 'wrap', gap: 0,
          marginBottom: 48,
        }}>
          {[
            { number: '250+', label: '爆款笔记' },
            { number: '1.2w+', label: '互动数据点' },
            { number: '5', label: '位博主 Agent' },
            { number: '5', label: '个品类' },
          ].map((s, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'stretch',
              borderRight: i < arr.length - 1 ? '1px solid #EDE5E2' : 'none',
            }}>
              <StatItem number={s.number} label={s.label} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={() => router.push('/explore')}
            style={{
              background: '#FF2442', color: '#fff', border: 'none',
              borderRadius: 8, padding: '14px 40px',
              fontSize: 15, fontWeight: 500, cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >开始探索</button>
          <button
            onClick={scrollToContent}
            style={{
              background: 'none', color: '#6B6B6B', border: '0.5px solid #F0E8E5',
              borderRadius: 8, padding: '13px 28px',
              fontSize: 15, cursor: 'pointer', transition: 'border-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = '#FF2442')}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = '#F0E8E5')}
          >了解更多</button>
        </div>

        <button
          onClick={scrollToContent}
          className="pulse-float"
          style={{
            position: 'absolute', bottom: 28, background: 'none',
            border: 'none', cursor: 'pointer', color: '#D0C8C4',
          }}
          aria-label="向下滚动"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v14M10 17l-5-5M10 17l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* ── Why Section ──────────────────────────────────────────────────── */}
      <div ref={bgRef} />
      <Section bg="#FFF8F5">
        <SectionTitle
          sub="访谈了 8 位刚起号的小红书博主，她们说——"
        >
          为什么做薯脑Rmind
        </SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <WhyCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#FF2442"/></svg>}
            label="陪跑太贵，学不起"
            quotes={[
              {
                text: <>找了个博主陪跑，<R>一次 3000</R>，跑了两次感觉也没学到什么。我就是个想副业的打工人，<R>哪来这个钱</R></>,
                author: '— 美妆博主，起号 2 个月',
              },
              {
                text: <>身边有个朋友找了陪跑老师，每周一次，<R>一年花了快两万</R>。我看着她的内容也没比我好多少。这钱花的太冤了</>,
                author: '— 穿搭博主，在职备考',
              },
            ]}
          />
          <WhyCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" fill="#FF2442"/></svg>}
            label="看不懂数据，不知道该怎么办"
            quotes={[
              {
                text: <>千瓜我买了三个月，<R>看了一堆折线图</R>，就是不知道这跟我自己有什么关系。数据挺好看的，<R>但我不会用</R></>,
                author: '— 美食博主，宝妈',
              },
              {
                text: <>我会刷爆款，会截图，<R>记了 200 条标题</R>。但轮到自己写的时候，完全空白。我缺的不是素材，是<R>判断力</R></>,
                author: '— 生活博主，起号 45 天',
              },
            ]}
          />
          <WhyCard
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" fill="#FF2442"/></svg>}
            label="AI 写稿太生硬，发不出手"
            quotes={[
              {
                text: <>ChatGPT 帮我生成的文案，<R>一眼就看出来是 AI 写的</R>。我的粉丝又不傻，我自己都尴尬，根本不敢发</>,
                author: '— 家居博主，想副业',
              },
              {
                text: <>我想学的是某个博主<R>说话的感觉</R>，不是让 AI 凑字数。我需要的不是模板，是<R>那个人的思路</R></>,
                author: '— 珠宝博主，职场新人',
              },
            ]}
          />
        </div>
      </Section>

      {/* ── Goals ────────────────────────────────────────────────────────── */}
      <Section bg="#FFFFFF">
        <SectionTitle sub="产品想解决的三个核心问题">
          薯脑Rmind 核心价值
        </SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <GoalCard
            icon={<IconOverlap />}
            title="让对标变得可对话"
            desc={<>传统对标工具只给你<R>数据和排行榜</R>。薯脑Rmind 让博主本身成为你随时可以提问的导师，而不是一张静态的分析报告。</>}
          />
          <GoalCard
            icon={<IconTarget />}
            title="从方法论到个性化建议"
            desc={<>爆款公式千篇一律，你的困境<R>独一无二</R>。薯脑Rmind 基于你的真实情况给出专属建议，而不是套话式「要做好人设」。</>}
          />
          <GoalCard
            icon={<IconPerson />}
            title={<><R>降低门槛</R>，让好的指导不再是奢侈品</>}
            desc="过去只有付得起几千块陪跑的博主才能得到专属指导。现在每个新人都能拥有自己的博主导师，随问随答。"
          />
        </div>
      </Section>

      {/* ── Competition ──────────────────────────────────────────────────── */}
      <Section bg="#FFF8F5">
        <SectionTitle sub="小红书博主工具现状分析">
          薯脑Rmind 产品定位
        </SectionTitle>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 32, alignItems: 'start',
        }}>
          {/* Quadrant Chart */}
          <div style={{
            background: '#fff', border: '0.5px solid #F0E8E5', borderRadius: 16,
            padding: '32px 24px',
          }}>
            <QuadrantChart />
          </div>

          {/* Target user + value */}
          <div style={{
            background: '#fff', border: '0.5px solid #F0E8E5', borderRadius: 16, padding: '36px 32px',
            display: 'flex', flexDirection: 'column', gap: 28,
          }}>
            <div>
              <p style={{
                fontSize: 11, color: '#FF2442', fontWeight: 700, letterSpacing: '0.1em',
                marginBottom: 14, textTransform: 'uppercase',
              }}>目标用户</p>
              <p style={{ fontSize: 15, color: '#1F1F1F', lineHeight: 1.85, margin: 0 }}>
                <R>刚起号 0~3 个月</R>的小红书新手博主。她们有内容生产意愿，但缺乏<R>判断力</R>和<R>个性化指导</R>，付不起高价陪跑，也看不懂复杂的数据分析平台。
              </p>
            </div>
            <div style={{ height: 1, background: '#F0E8E5' }} />
            <div>
              <p style={{
                fontSize: 11, color: '#FF2442', fontWeight: 700, letterSpacing: '0.1em',
                marginBottom: 14, textTransform: 'uppercase',
              }}>核心价值</p>
              <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.85, margin: 0 }}>
                把原本复杂的博主数据，通过<R>对话式 Agent</R> 重新呈现——<R>随时提问、随时获得专属回答</R>，像身边有个懂小红书的朋友。降低理解门槛，不再需要懂数据分析，只需要说出你的困惑。
              </p>
            </div>
          </div>
        </div>

        <p style={{
          fontSize: 15, color: '#6B6B6B', maxWidth: 700, margin: '40px auto 0',
          lineHeight: 1.85, textAlign: 'center',
        }}>
          市场上缺少一款把「<R>博主 Know-how</R>」与「<R>对话式 AI</R>」结合的工具。薯脑Rmind 填补的，是「像你最喜欢的博主一样思考，用你最熟悉的方式被指导」这个空白。
        </p>
      </Section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <Section bg="#FFFFFF">
        <SectionTitle sub="从博主笔记到Agent个性化对话">
          薯脑Rmind 工作原理
        </SectionTitle>

        {/* Step 1 */}
        <div style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 12, color: '#FF2442', fontWeight: 500, letterSpacing: '0.06em', marginBottom: 12 }}>
            STEP 01 · 数据解码管线
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>
            <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.9, margin: 0 }}>
              基于开源项目 blogger-distiller 构建数据采集与解码管线。对每位博主：
              <br /><br />
              扫码登录小红书，抓取最近 50 篇公开笔记，提取标题、正文、评论、点赞、收藏、发布时间等 <R>23 个维度数据</R>。通过 K-Means 聚类识别博主的内容主题分布，利用 LLM 结构化提取从笔记原文中抽取博主的价值观、口头禅、选题偏好、标题公式等，产出包含 <R>10 个章节</R>的 SKILL.md 档案。
              <br /><br />
              「脚本保下限，AI 冲上限」的架构——用规则保证数据可靠，用 LLM 挖掘深度洞察。
            </p>
            <FlowChart steps={['原始笔记（50篇）', '数据清洗 · 23维提取', '主题聚类（K-Means）', 'LLM 结构化解码', 'SKILL.md 档案（10章节）']} highlightLast />
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 72 }}>
          <p style={{ fontSize: 12, color: '#FF2442', fontWeight: 500, letterSpacing: '0.06em', marginBottom: 12 }}>
            STEP 02 · Prompt Engineering 迭代
          </p>
          <h3 style={{ fontSize: 22, fontWeight: 500, color: '#1F1F1F', marginBottom: 20 }}>
            从硬编码人格到泛用 wrapper，<R>5 轮迭代</R>
          </h3>
          <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.9, marginBottom: 32, maxWidth: 760 }}>
            让 AI 像某位博主一样说话，不是把 SKILL.md 塞进 Prompt 就完事。经历了 5 轮 wrapper 迭代，核心问题是：
            <br /><br />
            v1 直接硬编码人格 → 每个博主都要手写，<R>不可扩展</R>；v2 加三层穿透结构 → 回答变成报告，<R>失去对话感</R>；v3 引入任务映射表 → 解决了信息过载；v4 语气来源约束 → 解决了<R>「所有博主都说家人们」的 AI 感</R>；v5 泛用化 wrapper → 适配任意 SKILL.md 档案，当前版本。
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', maxWidth: 640, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>{['版本', '核心改进', '遗留问题'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', borderBottom: '0.5px solid #F0E8E5', color: '#1F1F1F', fontWeight: 500 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {[
                  ['v1', '硬编码博主特征', '不可扩展'],
                  ['v2', '三层穿透结构', '丧失对话感'],
                  ['v3', '任务映射表', '语气仍不准'],
                  ['v4', '语气来源约束', '仅适用单一档案'],
                  ['v5', '泛用化 wrapper', '当前版本'],
                ].map(([ver, core, issue]) => (
                  <tr key={ver}>
                    <td style={{ padding: '10px 16px', borderBottom: '0.5px solid #F0E8E5', color: '#FF2442', fontWeight: 500 }}>{ver}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '0.5px solid #F0E8E5', color: '#6B6B6B' }}>{core}</td>
                    <td style={{ padding: '10px 16px', borderBottom: '0.5px solid #F0E8E5', color: '#6B6B6B' }}>{issue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 3 */}
        <div>
          <p style={{ fontSize: 12, color: '#FF2442', fontWeight: 500, letterSpacing: '0.06em', marginBottom: 12 }}>
            STEP 03 · Agent 运行时架构
          </p>
          <h3 style={{ fontSize: 22, fontWeight: 500, color: '#1F1F1F', marginBottom: 20 }}>
            用户的每一次提问，经过怎样的链路
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'start' }}>
            <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.9, margin: 0 }}>
              用户输入问题 → 前端发送至 /api/chat → 服务端加载对应 SKILL.md → 与 wrapper 拼接生成 System Prompt → 注入 <code style={{ fontSize: 12, background: '#FFE4E6', padding: '1px 5px', borderRadius: 3, color: '#FF2442' }}>&lt;skill_document&gt;</code> 标签包裹的档案内容 → 调用 Claude API 流式响应 → 逐字符返回前端。
              <br /><br />
              首字符延迟控制在 <R>800ms 以内</R>，流式响应确保用户不会感受到等待。
            </p>
            <FlowChart
              steps={['用户输入', 'Next.js 前端', '/api/chat 路由', '读取 SKILL.md + wrapper', '拼接 System Prompt', 'Claude API（流式）', '返回前端 · 渐进显示']}
              highlightLast
            />
          </div>
        </div>
      </Section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#FFF8F5', borderTop: '0.5px solid #F0E8E5',
        padding: '52px 24px', textAlign: 'center',
      }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: '#1F1F1F', marginBottom: 6 }}>
          薯脑<span style={{ color: '#FF2442' }}>Rmind</span> · 为新手博主打造的对标神器
        </p>
        <p style={{ fontSize: 13, color: '#9B9B9B', margin: 0 }}>
          Made by FAN CHEN
        </p>
      </footer>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
