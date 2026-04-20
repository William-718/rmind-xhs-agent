import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SKILLS } from '@/data/skills/index'
import { WRAPPER_PROMPT } from '@/data/wrapper-prompt'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { bloggerId, messages } = await req.json()

    if (!bloggerId) {
      return NextResponse.json({ error: 'Missing bloggerId' }, { status: 400 })
    }

    const skillContent = SKILLS[bloggerId]
    if (!skillContent) {
      return NextResponse.json({ error: 'Blogger not found' }, { status: 404 })
    }

    const systemPrompt = `${skillContent}\n\n---\n\n${WRAPPER_PROMPT}`

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const apiMessages = (messages && messages.length > 0)
            ? messages
            : [{ role: 'user' as const, content: '请按照指引，现在开始打招呼。' }]

          const anthropicStream = await client.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: systemPrompt,
            messages: apiMessages,
          })

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
