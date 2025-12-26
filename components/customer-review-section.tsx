"use client";
import { useState, useEffect } from "react";
import { ReviewService, CustomerReview } from "@/lib/review-services";
import { Star, Quote, MapPin, Shield, ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerReviewSection() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const fetchedReviews = await ReviewService.getReviews(12);
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating = ReviewService.calculateAverageRating(reviews);
  const totalReviews = reviews.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, reviews.length - 2)) % Math.max(1, reviews.length - 2));
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Real reviews from our happy customers across India
          </p>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {renderStars(Math.round(averageRating), "lg")}
                <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
              </div>
              <p className="text-sm text-gray-600">
                Based on {totalReviews}+ reviews
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Verified Reviews</span>
            </div>
          </div>
        </div>

        {/* Reviews Slider */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full md:w-1/3 flex-shrink-0 px-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
                    {/* Quote Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <Quote className="h-8 w-8 text-blue-600 opacity-20" />
                      {review.source === 'google' && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">G</span>
                          </div>
                          <span>Google</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {review.rating}.0
                      </span>
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 mb-6 line-clamp-4">
                      "{review.reviewText}"
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {review.customerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.customerName}
                        </p>
                        {review.location && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            <span>{review.location}</span>
                          </div>
                        )}
                      </div>
                      {review.verified && (
                        <div className="ml-auto">
                          <div className="flex items-center space-x-1 text-green-600">
                            <Shield className="h-3 w-3" />
                            <span className="text-xs">Verified</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {new Date(review.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {reviews.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {reviews.length > 3 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: Math.max(1, reviews.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Google Reviews Link */}
        <div className="text-center mt-8">
          <a
            href="https://www.google.com/search?q=lunarz+india+reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span>View all reviews on Google</span>
          </a>
        </div>
      </div>
    </section>
  );
}