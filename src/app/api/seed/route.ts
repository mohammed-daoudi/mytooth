import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST(req: NextRequest) {
  try {
    // Only allow seeding in development environment for security
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding is not allowed in production' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reset = body.reset === true;

    const result = await seedDatabase(reset);

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to seed the database',
    note: 'Only available in development environment',
  });
}
