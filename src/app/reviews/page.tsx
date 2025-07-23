"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/AuthProvider';
import { AccessControl } from '@/components/ProtectedRoute';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Filter,
  Plus,
  Calendar,
  Award,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Heart,
  Quote,
  Sparkles,
  ChevronDown,
  Search
} from 'lucide-react';

// Review form validation schema
const reviewSchema = z.object({
  dentist: z.string().min(1, 'Please select a dentist'),
  service: z.string().min(1, 'Please select a service'),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be 5 or less'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment must be less than 500 characters'),
  isPublic: z.boolean(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  _id: string;
  patient: {
    name: string;
    email: string;
    avatar?: string;
  };
  dentist: {
    name: string;
    specialization: string;
  };
  service: {
    name: string;
  };
  rating: number;
  title: string;
  comment: string;
  helpful: number;
  createdAt: string;
  isVerified: boolean;
}

interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  ratingDistribution: Array<{ _id: number; count: number }>;
}

const StarRating = ({ rating, size = 'sm', interactive = false, onRatingChange }: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            interactive ? 'cursor-pointer' : ''
          } ${
            star <= (hoverRating || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } transition-colors`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onHelpful }: { review: Review; onHelpful: (id: string) => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={review.patient.avatar} alt={review.patient.name} />
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  {review.patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-slate-900">{review.patient.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span>Treated by Dr. {review.dentist.name}</span>
                  <span>•</span>
                  <span>{review.service.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} size="sm" />
              {review.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold text-lg text-slate-900 mb-2">{review.title}</h5>
              <p className="text-slate-600 leading-relaxed">{review.comment}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHelpful(review._id)}
                className="hover:bg-blue-50 hover:text-blue-600"
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful ({review.helpful})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatsCard = ({ stats }: { stats: ReviewStats }) => {
  const getRatingPercentage = (rating: number) => {
    const ratingData = stats.ratingDistribution.find(r => r._id === rating);
    return stats.totalReviews > 0 ? ((ratingData?.count || 0) / stats.totalReviews) * 100 : 0;
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Patient Reviews</CardTitle>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <StarRating rating={Math.round(stats.avgRating)} size="lg" />
            <span className="text-3xl font-bold text-slate-900">{stats.avgRating.toFixed(1)}</span>
          </div>
          <p className="text-slate-600">Based on {stats.totalReviews} reviews</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm font-medium w-8">{rating}</span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <span className="text-sm text-slate-600 w-10">
                {getRatingPercentage(rating).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      isPublic: true,
      rating: 5
    }
  });

  const watchedRating = watch('rating');

  // Mock data for form selects (in real app, fetch from API)
  const dentists = [
    { id: '1', name: 'Dr. Sarah Johnson', specialization: 'General Dentistry' },
    { id: '2', name: 'Dr. Michael Chen', specialization: 'Orthodontics' },
    { id: '3', name: 'Dr. Emily Davis', specialization: 'Periodontics' },
  ];

  const services = [
    { id: '1', name: 'Teeth Cleaning' },
    { id: '2', name: 'Teeth Whitening' },
    { id: '3', name: 'Dental Implants' },
    { id: '4', name: 'Root Canal' },
    { id: '5', name: 'Orthodontic Treatment' },
  ];

  const fetchReviews = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await fetch(`/api/reviews?page=${pageNum}&limit=6`);
      const data = await response.json();

      if (response.ok) {
        if (append) {
          setReviews(prev => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
          setStats(data.stats);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onSubmit = async (data: ReviewFormData) => {
    if (!isAuthenticated) {
      setSubmitError('Please log in to submit a review');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        reset();
        setDialogOpen(false);
        // Refresh reviews
        fetchReviews();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setSubmitError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    // In real app, this would make an API call to increment helpful count
    setReviews(prev => prev.map(review =>
      review._id === reviewId
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      fetchReviews(page + 1, true);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.patient.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

    return matchesSearch && matchesRating;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center mb-6">
              <Quote className="h-12 w-12 text-cyan-400 mr-4" />
              <h1 className="text-4xl lg:text-6xl font-bold">
                Patient Reviews
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-slate-300 mb-8">
              Hear from our satisfied patients about their experiences at My Tooth.
              Your smile is our success story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AccessControl
                allowedRoles={['patient', 'admin']}
                fallback={
                  <Button size="lg" className="dental-gradient" disabled>
                    <Plus className="mr-2 h-5 w-5" />
                    Login to Write Review
                  </Button>
                }
              >
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="dental-gradient">
                      <Plus className="mr-2 h-5 w-5" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </AccessControl>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                <MessageSquare className="mr-2 h-5 w-5" />
                Read Reviews
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Alert */}
      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Alert className="border-green-200 bg-green-50 text-green-800 shadow-lg">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Thank you for your review! It will be published after verification.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats and Filters Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Stats Card */}
            <div className="lg:col-span-1">
              {stats ? (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <StatsCard stats={stats} />
                </motion.div>
              ) : (
                <Card className="border-0 shadow-xl">
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-16 w-full mb-4" />
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} className="h-4 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews Section */}
            <div className="lg:col-span-3">
              {/* Search and Filter Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-full md:w-48">
                          <SelectValue placeholder="Filter by rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reviews Grid */}
              {loading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-1/3 mb-2" />
                            <Skeleton className="h-3 w-1/2 mb-4" />
                            <Skeleton className="h-20 w-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      onHelpful={handleHelpful}
                    />
                  ))}

                  {hasMore && (
                    <div className="text-center pt-8">
                      <Button onClick={loadMore} variant="outline" size="lg">
                        <ChevronDown className="mr-2 h-4 w-4" />
                        Load More Reviews
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No reviews found</h3>
                  <p className="text-slate-500">
                    {searchTerm || ratingFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Be the first to share your experience!'
                    }
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Review Submission Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience to help other patients make informed decisions.
            </DialogDescription>
          </DialogHeader>

          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dentist">Dentist *</Label>
                <Select onValueChange={(value) => setValue('dentist', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select dentist" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists.map(dentist => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                        Dr. {dentist.name} - {dentist.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dentist && (
                  <p className="text-sm text-red-600 mt-1">{errors.dentist.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="service">Service *</Label>
                <Select onValueChange={(value) => setValue('service', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service && (
                  <p className="text-sm text-red-600 mt-1">{errors.service.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Rating *</Label>
              <div className="mt-2">
                <StarRating
                  rating={watchedRating}
                  size="lg"
                  interactive
                  onRatingChange={(rating) => setValue('rating', rating)}
                />
              </div>
              {errors.rating && (
                <p className="text-sm text-red-600 mt-1">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title">Review Title *</Label>
              <Input
                id="title"
                placeholder="Summarize your experience"
                {...register('title')}
                className="mt-2"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="comment">Your Review *</Label>
              <Textarea
                id="comment"
                rows={4}
                placeholder="Share details about your experience..."
                {...register('comment')}
                className="mt-2"
              />
              {errors.comment && (
                <p className="text-sm text-red-600 mt-1">{errors.comment.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                {...register('isPublic')}
                className="rounded"
              />
              <Label htmlFor="isPublic" className="text-sm">
                Make this review public (others can see it)
              </Label>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                className="flex-1 dental-gradient"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4" />
                    <span>Submit Review</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-cyan-300 mr-3" />
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Experience Excellence?
              </h2>
            </div>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto">
              Join thousands of satisfied patients who trust My Tooth for their dental care.
              Book your appointment today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-cyan-600 hover:bg-gray-100">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-cyan-600">
                <Users className="mr-2 h-5 w-5" />
                Meet Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
