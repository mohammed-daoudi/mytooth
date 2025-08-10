import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dentist from '@/models/Dentist';
import User from '@/models/User';

// GET /api/dentists/[id] - Get specific dentist
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
      // Return fallback dentist data when database is unavailable
      const fallbackDentists = {
        '1': {
          _id: '1',
          name: 'Dr. Sarah Johnson',
          email: 'dr.sarah@mytooth.com',
          phone: '+1-555-0123',
          profileImage: null,
          specialization: 'General & Cosmetic Dentistry',
          bio: 'Experienced general dentist with focus on cosmetic procedures',
          licenseNumber: 'DENT123456',
          yearsOfExperience: 8,
          education: ['DDS - University of Dental School'],
          certifications: ['Cosmetic Dentistry', 'Invisalign Provider'],
          availabilityConfig: { workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
          consultationFee: 100,
          rating: 4.8,
          totalReviews: 127,
          isActive: true
        }
      };
      
      const fallbackDentist = fallbackDentists[params.id as keyof typeof fallbackDentists];
      if (fallbackDentist) {
        return NextResponse.json(fallbackDentist);
      }
      
      return NextResponse.json(
        { error: 'Dentist not found' },
        { status: 404 }
      );
    }

    const dentist = await Dentist.findById(params.id)
      .populate('userId', 'name email phone profileImage')
      .where('deletedAt').exists(false);

    if (!dentist) {
      return NextResponse.json(
        { error: 'Dentist not found' },
        { status: 404 }
      );
    }

    // Format response
    const formattedDentist = {
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
    };

    return NextResponse.json(formattedDentist);

  } catch (error) {
    console.error('Error fetching dentist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
