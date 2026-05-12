import { NextResponse } from 'next/server';
import { outcomeStore } from '@/lib/procurement/outcomeStore';
import { procurementStore } from '@/lib/procurement/procurementStore';

export async function GET() {
  try {
    const outcomes = await outcomeStore.getAllOutcomes();
    return NextResponse.json(outcomes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch outcomes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { poId } = await request.json();
    const draft = await procurementStore.getDraftById(poId);
    
    if (!draft) {
      return NextResponse.json({ error: 'PO not found' }, { status: 404 });
    }

    const recordedOutcomes = await outcomeStore.recordFromPO(draft);
    return NextResponse.json(recordedOutcomes);
  } catch (error) {
    console.error('Failed to record outcomes:', error);
    return NextResponse.json({ error: 'Failed to record outcomes' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Outcome ID required' }, { status: 400 });
    }

    await outcomeStore.updateOutcome(id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update outcome' }, { status: 500 });
  }
}
