import { NextResponse } from 'next/server';
import { supplierService } from '@/services/supplierService';

export async function GET() {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error('API Error in suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}
