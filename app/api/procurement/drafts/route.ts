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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierId, supplierName, item } = body;
    
    if (!supplierId || !supplierName || !item) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const draft = await procurementStore.addItemToDraft(supplierId, supplierName, item);
    return NextResponse.json(draft);
  } catch (error) {
    console.error('Failed to add item to draft:', error);
    return NextResponse.json({ error: 'Failed to add item to draft' }, { status: 500 });
  }
}
