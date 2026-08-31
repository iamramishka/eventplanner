import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been removed. Use POST /api/vendors/[id]/quote instead.' },
    { status: 410 }
  );
}
