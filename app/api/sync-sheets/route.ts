import { NextResponse } from 'next/server';
import { syncService } from '@/services/syncService';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, range } = await request.json();

    if (!spreadsheetId || !range) {
      return NextResponse.json(
        { error: 'spreadsheetId and range are required' },
        { status: 400 }
      );
    }

    const summary = await syncService.syncSuppliersFromSheets(spreadsheetId, range);

    return NextResponse.json({
      success: true,
      ...summary
    });
  } catch (error: any) {
    console.error('API Error in sync-sheets:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
