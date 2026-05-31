import { supabase } from './supabase';

export interface CustomerReview {
  id: string;
  customerName: string;
  customerImage?: string;
  rating: number; // 1-5 stars
  reviewText: string;
  date: string;
  verified: boolean;
  source: 'google' | 'website' | 'manual';
  googleReviewId?: string; // For Google Reviews integration
  location?: string;
  isActive: boolean; // For admin to show/hide reviews
}

export class ReviewService {
  // Get all reviews for display (only active ones)
  static async getReviews(limitCount: number = 10): Promise<CustomerReview[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: false })
        .limit(limitCount);

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        customerName: row.customer_name,
        customerImage: row.customer_image,
        rating: row.rating,
        reviewText: row.review_text,
        date: row.date,
        verified: row.verified,
        source: row.source,
        googleReviewId: row.google_review_id,
        location: row.location,
        isActive: row.is_active,
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return this.getMockReviews(); // Fallback to mock data
    }
  }

  // Get all reviews for admin (including inactive ones)
  static async getAllReviewsForAdmin(): Promise<CustomerReview[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        customerName: row.customer_name,
        customerImage: row.customer_image,
        rating: row.rating,
        reviewText: row.review_text,
        date: row.date,
        verified: row.verified,
        source: row.source,
        googleReviewId: row.google_review_id,
        location: row.location,
        isActive: row.is_active,
      }));
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      return [];
    }
  }

  // Add a new review (for manual entry or website reviews)
  static async addReview(review: Omit<CustomerReview, "id">): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          customer_name: review.customerName,
          customer_image: review.customerImage,
          rating: review.rating,
          review_text: review.reviewText,
          verified: review.verified,
          source: review.source,
          google_review_id: review.googleReviewId,
          location: review.location,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }

  // Update a review
  static async updateReview(reviewId: string, updates: Partial<CustomerReview>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
      if (updates.customerImage !== undefined) updateData.customer_image = updates.customerImage;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.reviewText !== undefined) updateData.review_text = updates.reviewText;
      if (updates.verified !== undefined) updateData.verified = updates.verified;
      if (updates.source !== undefined) updateData.source = updates.source;
      if (updates.googleReviewId !== undefined) updateData.google_review_id = updates.googleReviewId;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  // Delete a review
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  // Toggle review active status
  static async toggleReviewStatus(reviewId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_active: isActive })
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(`Failed to toggle review status: ${error.message}`);
    }
  }

  // Get review by ID
  static async getReviewById(reviewId: string): Promise<CustomerReview | null> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        customerName: data.customer_name,
        customerImage: data.customer_image,
        rating: data.rating,
        reviewText: data.review_text,
        date: data.date,
        verified: data.verified,
        source: data.source,
        googleReviewId: data.google_review_id,
        location: data.location,
        isActive: data.is_active,
      };
    } catch (error) {
      console.error("Error fetching review:", error);
      return null;
    }
  }

  // Sync with Google Reviews (placeholder for future implementation)
  static async syncGoogleReviews(): Promise<void> {
    try {
      // This would integrate with Google My Business API
      // For now, we'll use mock data
      console.log("Google Reviews sync would happen here");
    } catch (error) {
      console.error("Error syncing Google Reviews:", error);
    }
  }

  // Get mock reviews for development/fallback
  static getMockReviews(): CustomerReview[] {
    return [
      {
        id: "1",
        customerName: "Priya Sharma",
        customerImage: "",
        rating: 5,
        reviewText: "Amazing quality t-shirts! The fabric is so soft and the designs are unique. Perfect fit and fast delivery. Definitely ordering more!",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Mumbai, India",
        isActive: true
      },
      {
        id: "2",
        customerName: "Rahul Kumar",
        customerImage: "",
        rating: 5,
        reviewText: "Fast delivery and excellent customer service. The anime collection is fantastic! Great quality materials and vibrant prints.",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Delhi, India",
        isActive: true
      },
      {
        id: "3",
        customerName: "Sneha Patel",
        customerImage: "",
        rating: 4,
        reviewText: "Great fit and comfortable material. Love the streetwear collection. Will recommend to friends! Packaging was also very nice.",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Bangalore, India",
        isActive: true
      },
      {
        id: "4",
        customerName: "Arjun Singh",
        customerImage: "",
        rating: 5,
        reviewText: "Best online t-shirt store! Quality is top-notch and prices are reasonable. Highly satisfied with my purchase. Keep it up!",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Pune, India",
        isActive: true
      },
      {
        id: "5",
        customerName: "Kavya Reddy",
        customerImage: "",
        rating: 5,
        reviewText: "Loved the Pink Floyd collection! Perfect for music lovers. Great quality and fast shipping. The design quality is outstanding.",
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Hyderabad, India",
        isActive: true
      },
      {
        id: "6",
        customerName: "Vikash Gupta",
        customerImage: "",
        rating: 4,
        reviewText: "Good collection and reasonable prices. The material quality is impressive. Customer support was very helpful. Keep it up!",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Chennai, India",
        isActive: true
      },
      {
        id: "7",
        customerName: "Anita Joshi",
        customerImage: "",
        rating: 5,
        reviewText: "Excellent service and product quality. The t-shirts are very comfortable and the prints are vibrant. Highly recommended!",
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Jaipur, India",
        isActive: true
      },
      {
        id: "8",
        customerName: "Rohit Mehta",
        customerImage: "",
        rating: 4,
        reviewText: "Great variety of designs and good quality fabric. Delivery was on time. Will definitely shop again. Good value for money.",
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Ahmedabad, India",
        isActive: true
      }
    ];
  }

  // Calculate average rating
  static calculateAverageRating(reviews: CustomerReview[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
  }

  // Get rating distribution
  static getRatingDistribution(reviews: CustomerReview[]): Record<number, number> {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  }

  // Get review statistics for admin
  static getReviewStats(reviews: CustomerReview[]) {
    const totalReviews = reviews.length;
    const activeReviews = reviews.filter(r => r.isActive !== false).length;
    const averageRating = this.calculateAverageRating(reviews);
    const ratingDistribution = this.getRatingDistribution(reviews);
    
    return {
      totalReviews,
      activeReviews,
      inactiveReviews: totalReviews - activeReviews,
      averageRating,
      ratingDistribution,
      sourceDistribution: {
        google: reviews.filter(r => r.source === 'google').length,
        website: reviews.filter(r => r.source === 'website').length,
        manual: reviews.filter(r => r.source === 'manual').length,
      }
    };
  }
}
