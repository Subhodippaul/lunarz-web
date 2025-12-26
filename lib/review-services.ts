import {
  collection,
  doc,
  addDoc,
  getDocs,
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
}

export class ReviewService {
  // Get all reviews for display
  static async getReviews(limitCount: number = 10): Promise<CustomerReview[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        orderBy("date", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate?.()?.toISOString() || doc.data().date,
      })) as CustomerReview[];
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return this.getMockReviews(); // Fallback to mock data
    }
  }

  // Add a new review (for manual entry or website reviews)
  static async addReview(review: Omit<CustomerReview, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        ...review,
        date: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add review: ${error.message}`);
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
        customerImage: "/placeholder-avatar.jpg",
        rating: 5,
        reviewText: "Amazing quality t-shirts! The fabric is so soft and the designs are unique. Definitely ordering more!",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Mumbai, India"
      },
      {
        id: "2",
        customerName: "Rahul Kumar",
        customerImage: "/placeholder-avatar.jpg",
        rating: 5,
        reviewText: "Fast delivery and excellent customer service. The anime collection is fantastic!",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Delhi, India"
      },
      {
        id: "3",
        customerName: "Sneha Patel",
        customerImage: "/placeholder-avatar.jpg",
        rating: 4,
        reviewText: "Great fit and comfortable material. Love the streetwear collection. Will recommend to friends!",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Bangalore, India"
      },
      {
        id: "4",
        customerName: "Arjun Singh",
        customerImage: "/placeholder-avatar.jpg",
        rating: 5,
        reviewText: "Best online t-shirt store! Quality is top-notch and prices are reasonable. Highly satisfied!",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Pune, India"
      },
      {
        id: "5",
        customerName: "Kavya Reddy",
        customerImage: "/placeholder-avatar.jpg",
        rating: 5,
        reviewText: "Loved the Pink Floyd collection! Perfect for music lovers. Great quality and fast shipping.",
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Hyderabad, India"
      },
      {
        id: "6",
        customerName: "Vikash Gupta",
        customerImage: "/placeholder-avatar.jpg",
        rating: 4,
        reviewText: "Good collection and reasonable prices. The material quality is impressive. Keep it up!",
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        source: 'google',
        location: "Chennai, India"
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
}