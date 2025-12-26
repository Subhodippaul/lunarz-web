import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Collections
const COLLECTIONS = {
  REVIEWS: "reviews",
} as const;

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
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        orderBy("date", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      })) as CustomerReview[];

      // Filter only active reviews for public display
      return reviews.filter(review => review.isActive !== false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return this.getMockReviews(); // Fallback to mock data
    }
  }

  // Get all reviews for admin (including inactive ones)
  static async getAllReviewsForAdmin(): Promise<CustomerReview[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      })) as CustomerReview[];
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      return [];
    }
  }

  // Add a new review (for manual entry or website reviews)
  static async addReview(review: Omit<CustomerReview, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        ...review,
        date: Timestamp.now(),
        createdAt: Timestamp.now(),
        isActive: true, // Default to active
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add review: ${error.message}`);
    }
  }

  // Update a review
  static async updateReview(reviewId: string, updates: Partial<CustomerReview>): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  // Delete a review
  static async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      await deleteDoc(reviewRef);
    } catch (error: any) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  // Toggle review active status
  static async toggleReviewStatus(reviewId: string, isActive: boolean): Promise<void> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      await updateDoc(reviewRef, {
        isActive,
        updatedAt: Timestamp.now(),
      });
    } catch (error: any) {
      throw new Error(`Failed to toggle review status: ${error.message}`);
    }
  }

  // Get review by ID
  static async getReviewById(reviewId: string): Promise<CustomerReview | null> {
    try {
      const reviewRef = doc(db, COLLECTIONS.REVIEWS, reviewId);
      const reviewDoc = await getDoc(reviewRef);
      
      if (!reviewDoc.exists()) {
        return null;
      }

      return {
        id: reviewDoc.id,
        ...reviewDoc.data(),
        date: reviewDoc.data().date?.toDate?.()?.toISOString() || reviewDoc.data().date,
      } as CustomerReview;
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
      
      // Example of how Google Reviews would be processed:
      // const googleReviews = await fetchGoogleReviews();
      // for (const review of googleReviews) {
      //   await this.addReview({
      //     customerName: review.author_name,
      //     customerImage: review.profile_photo_url,
      //     rating: review.rating,
      //     reviewText: review.text,
      //     date: review.time,
      //     verified: true,
      //     source: 'google',
      //     googleReviewId: review.id,
      //     location: 'India',
      //     isActive: true,
      //   });
      // }
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