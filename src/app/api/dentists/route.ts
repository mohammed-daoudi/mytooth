import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dentist from '@/models/Dentist';
import User from '@/models/User';

// GET /api/dentists - Get list of dentists
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const specialization = searchParams.get('specialization');
    const isActive = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    interface DentistQuery {
      specialization?: string;
      isActive?: boolean;
      deletedAt: { $exists: boolean };
    }
    const query: DentistQuery = { deletedAt: { $exists: false } };

    if (specialization) {
      query.specialization = specialization;
    }

    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const dentists = await Dentist.find(query)
      .populate('userId', 'name email phone profileImage')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Dentist.countDocuments(query);

    // Format response
    const formattedDentists = dentists.map(dentist => ({
      _id: dentist._id,
      name: dentist.userId.name,
      email: dentist.userId.email,
      phone: dentist.userId.phone,
      profileImage: dentist.userId.profileImage,
      specialization: dentist.specialization,
      bio: dentist.bio,
      licenseNumber: dentist.licenseNumber,
      yearsOfExperience: dentist.yearsOfExperience,
      education: dentist.education,
      certifications: dentist.certifications,
      availabilityConfig: dentist.availabilityConfig,
      consultationFee: dentist.consultationFee,
      rating: dentist.rating,
      totalReviews: dentist.totalReviews,
      isActive: dentist.isActive
    }));

    return NextResponse.json({
      dentists: formattedDentists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching dentists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
