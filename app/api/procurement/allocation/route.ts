import { NextResponse } from 'next/server';
import { procurementStore } from '@/lib/procurement/procurementStore';
import { capitalAllocationEngine } from '@/lib/procurement/capitalAllocationEngine';

export async function POST(request: Request) {
  try {
    const { capital } = await request.json();
    
    if (typeof capital !== 'number' || capital <= 0) {
      return NextResponse.json({ error: 'Valid capital amount required' }, { status: 400 });
    }

    const drafts = await procurementStore.getAllDrafts();
    // Only allocate for active drafts
    const activeDrafts = drafts.filter(d => d.status === 'draft');
    
    const metrics = await capitalAllocationEngine.computeSupplierMetrics(activeDrafts);
    const allocation = capitalAllocationEngine.allocate(capital, metrics);

    return NextResponse.json({
      totalCapital: capital,
      allocation,
      summary: {
        totalSuppliers: allocation.length,
        avgROI: allocation.reduce((sum, a) => sum + a.expectedROI, 0) / (allocation.length || 1),
      }
    });
  } catch (error) {
    console.error('Allocation failed:', error);
    return NextResponse.json({ error: 'Allocation engine failed' }, { status: 500 });
  }
}
