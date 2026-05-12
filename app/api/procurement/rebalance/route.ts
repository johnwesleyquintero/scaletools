import { NextResponse } from 'next/server';
import { capitalRebalancer } from '@/lib/procurement/capitalRebalancer';

export async function POST(request: Request) {
  try {
    const { totalCapital } = await request.json();
    
    if (typeof totalCapital !== 'number' || totalCapital <= 0) {
      return NextResponse.json({ error: 'Valid total capital required' }, { status: 400 });
    }

    const result = await capitalRebalancer.analyze(totalCapital);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Rebalance analysis failed:', error);
    return NextResponse.json({ error: 'Rebalance engine failed' }, { status: 500 });
  }
}
