import { NextResponse } from 'next/server';

const VALID = ['MARKET-2026', 'MARCUS2026', 'INTEL2026'];
export async function POST(req) {
  const { code } = await req.json();
  return NextResponse.json(VALID.includes(code.trim().toUpperCase()) ? { ok: true } : { ok: false, error: 'Invalid access code' });
}
