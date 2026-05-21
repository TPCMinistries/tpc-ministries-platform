import { NextResponse } from 'next/server'

// Pack-the-Mission pledges were a pre-trip fundraising mechanism for Kenya 2026.
// The trip ended May 6 2026; the page /kenya/pack-the-mission now redirects
// to the /kenya-2026 recap. This route is retired and returns 410 Gone for
// any straggling client that still has the URL cached.

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(
    { error: 'Gone', message: 'Pack-the-Mission pledges closed when Kenya 2026 concluded. See /kenya-2026 for the recap.' },
    { status: 410 },
  )
}

export async function POST() {
  return NextResponse.json(
    { error: 'Gone', message: 'Pack-the-Mission pledges closed when Kenya 2026 concluded.' },
    { status: 410 },
  )
}
