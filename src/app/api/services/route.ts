import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { requireAuth, hasRole, ROLES } from '@/lib/auth';
import { serviceSchema, serviceFilterSchema } from '@/lib/validations';

// Define types for service documents
interface ServiceDocument {
  _id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  image?: string;
  painLevel: number;
  requirements?: string[];
  afterCareInstructions?: string;
  isActive: boolean;
}

interface ServiceFilter {
  isActive: boolean;
  category?: string;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
}

// GET all services with optional filtering
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isActive = searchParams.get('active') !== 'false'; // Default to true

    const filter: ServiceFilter = { isActive };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const services = await Service.find(filter)
      .sort({ category: 1, name: 1 })
      .lean();

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      services: services.map((service: Record<string, any>) => ({
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        image: service.image,
        painLevel: service.painLevel,
        requirements: service.requirements,
        afterCareInstructions: service.afterCareInstructions,
      })),
    });

  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new service (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const tokenPayload = await requireAuth(req);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasRole(tokenPayload.payload!.role, [ROLES.ADMIN, ROLES.DENTIST])) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = serviceSchema.parse(body);

    // Check if service with same name already exists
    const existingService = await Service.findOne({
      name: { $regex: new RegExp(`^${validatedData.name}$`, 'i') }
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Service with this name already exists' },
        { status: 400 }
      );
    }

    const service = new Service(validatedData);
    await service.save();

    return NextResponse.json({
      message: 'Service created successfully',
      service: {
        id: service._id.toString(),
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        image: service.image,
        painLevel: service.painLevel,
        requirements: service.requirements,
        afterCareInstructions: service.afterCareInstructions,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create service error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
