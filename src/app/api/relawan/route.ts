import { NextResponse } from 'next/server'
import { dummyRelawan } from '@/data/dummyRelawan'

export async function GET() {
  return NextResponse.json(dummyRelawan)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newRelawan = {
      id: `r-${Date.now()}`,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(newRelawan, { status: 201 })
  } catch {
    return NextResponse.json(
      { message: 'Failed to create relawan' },
      { status: 500 }
    )
  }
}
