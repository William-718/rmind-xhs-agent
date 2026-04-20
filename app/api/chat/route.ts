import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import path from 'path'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { bloggerId, messages } = await req.json()

    if (!bloggerId) {
      return NextResponse.json({ error: 'Missing bloggerId' }, { status: 400 })
    }

    // Load bloggers.json to get skillFile path
    const bloggersPath = path.join(process.cwd(), 'data', 'bloggers.json')
    const bloggers = JSON.parse(readFileSync(bloggersPath, 'utf-8'))
    const blogger = bloggers.find((b: { id: string }) => b.id === bloggerId)

    if (!blogger) {
      return NextResponse.json({ error: 'Blogger not found' }, { status: 404 })
    }

    // Read SKILL.md
    const skillPath = path.join(process.cwd(), blogger.skillFile)
    const skillContent = readFileSync(skillPath, 'utf-8')

    // Read wrapper prompt
    const wrapperPath = path.join(process.cwd(), 'data', 'wrapper-prompt.md')
    const wrapperContent = readFileSync(wrapperPath, 'utf-8')

    // System prompt = SKILL.md content + wrapper instructions
    const systemPrompt = `${skillContent}\n\n---\n\n${wrapperContent}`

    // Stream response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Anthropic requires at least 1 message; empty array = greeting trigger
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
