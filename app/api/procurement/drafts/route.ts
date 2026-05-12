import { NextResponse } from 'next/server';
import { procurementStore } from '@/lib/procurement/procurementStore';

export async function GET() {
  try {
    const drafts = await procurementStore.getAllDrafts();
    return NextResponse.json(drafts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}
