import { NextResponse } from 'next/server';
import { productService } from '@/services/productService';

export async function POST(request: Request) {
  try {
    const { asin, title } = await request.json();

    if (!asin) {
      return NextResponse.json(
        { error: 'asin is required' },
        { status: 400 }
      );
    }

    const result = await productService.analyzeProduct(asin, title);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in product-match:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
