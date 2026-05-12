import { NextResponse } from 'next/server';
import { procurementStore } from '@/lib/procurement/procurementStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const draft = await procurementStore.getDraftById(id);
    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }
    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existingDraft = await procurementStore.getDraftById(id);
    
    if (!existingDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }
    
    const updatedDraft = { ...existingDraft, ...body };
    await procurementStore.upsertDraft(updatedDraft);
    
    return NextResponse.json(updatedDraft);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 });
  }
}
