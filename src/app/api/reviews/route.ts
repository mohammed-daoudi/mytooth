import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';
import Service from '@/models/Service';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get public and verified reviews only
    const reviews = await Review.find({
      isPublic: true,
      isVerified: true
    })
      .populate('patient', 'name email avatar')
      .populate('dentist', 'name specialization')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      isPublic: true,
      isVerified: true
    });

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      { $match: { isPublic: true, isVerified: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const avgRating = avgRatingResult[0]?.avgRating || 0;

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { isPublic: true, isVerified: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: total,
        ratingDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);

    if (!userData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { dentist, service, appointment, rating, title, comment, isPublic = true } = body;

    // Validate required fields
    if (!dentist || !service || !rating || !title || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this service
    const existingReview = await Review.findOne({
      patient: userData.userId,
      service: service
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this service' },
        { status: 400 }
      );
    }

    // Verify dentist exists
    const dentistUser = await User.findById(dentist);
    if (!dentistUser || dentistUser.role !== 'dentist') {
      return NextResponse.json(
        { error: 'Invalid dentist' },
        { status: 400 }
      );
    }

    // Verify service exists
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return NextResponse.json(
        { error: 'Invalid service' },
        { status: 400 }
      );
    }

    // Create review
    const review = new Review({
      patient: userData.userId,
      dentist,
      service,
      appointment,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      isPublic,
      isVerified: false // Reviews need to be verified by admin
    });

    await review.save();

    // Populate the review before returning
    await review.populate('patient', 'name email avatar');
    await review.populate('dentist', 'name specialization');
    await review.populate('service', 'name');

    return NextResponse.json({
      message: 'Review submitted successfully. It will be published after verification.',
      review
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
