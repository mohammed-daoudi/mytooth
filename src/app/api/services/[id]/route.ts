import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';

// GET /api/services/[id] - Get specific service
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Try to connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.warn('Database connection failed, using fallback data:', dbError);
      // Return fallback service data when database is unavailable
      const fallbackServices = {
        '68844eaaecf2464196e843ab': {
          _id: '68844eaaecf2464196e843ab',
          name: 'General Consultation',
          description: 'Comprehensive dental examination and consultation',
          duration: 60,
          price: 100,
          category: 'General',
          isActive: true
        }
      };
      
      const fallbackService = fallbackServices[params.id as keyof typeof fallbackServices];
      if (fallbackService) {
        return NextResponse.json(fallbackService);
      }
      
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const service = await Service.findById(params.id);

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(service);

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
