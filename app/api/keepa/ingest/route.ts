import { NextResponse } from 'next/server';
import { keepaIngestionService } from '@/services/keepaIngestionService';

export async function POST(request: Request) {
  try {
    const { csvContent } = await request.json();

    if (!csvContent) {
      return NextResponse.json(
        { error: 'csvContent is required' },
        { status: 400 }
      );
    }

    const result = await keepaIngestionService.ingestCSV(csvContent);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error in keepa/ingest:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
