import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'bloggers.json')
  const data = readFileSync(filePath, 'utf-8')
  return NextResponse.json(JSON.parse(data))
}
