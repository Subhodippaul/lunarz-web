"use client";
import { useState, useEffect } from "react";
import { ReviewService, CustomerReview } from "@/lib/review-services";
import { Star, Quote, MapPin, Shield, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export default function CustomerReviewSection() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchReviews();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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

  // Calculate items per view and max index
  const itemsPerView = isMobile ? 1 : 4;
  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(Math.max(index, 0), maxIndex));
  };

  // Generate random avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
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

  // Get visible reviews based on current index
  const getVisibleReviews = () => {
    return reviews.slice(currentIndex, currentIndex + itemsPerView);
  };

  // Calculate dot indicators (show dots for every possible starting position)
  const totalDots = maxIndex + 1;

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              No reviews available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const visibleReviews = getVisibleReviews();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                width: `${(reviews.length / itemsPerView) * 100}%`
              }}
            >
              {reviews.map((review, index) => (
                <div 
                  key={review.id} 
                  className={`${isMobile ? 'w-full' : 'w-1/4'} shrink-0 ${isMobile ? 'px-0' : 'px-3'}`}
                >
                  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow ${isMobile ? 'mx-2' : ''}`}>
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
                    <p className="text-gray-700 mb-6 line-clamp-4 text-sm leading-relaxed">
                      "{review.reviewText}"
                    </p>

                    {/* Customer Info */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getAvatarColor(review.customerName)} rounded-full flex items-center justify-center`}>
                        {review.customerImage ? (
                          <img 
                            src={review.customerImage} 
                            alt={review.customerName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-lg">
                            {review.customerName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
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
                        <div className="flex items-center space-x-1 text-green-600">
                          <Shield className="h-3 w-3" />
                          <span className="text-xs">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {reviews.length > itemsPerView && (
            <>
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className={`absolute left-0 top-1/2 -translate-y-1/2 ${isMobile ? '-translate-x-2' : '-translate-x-4'} bg-white rounded-full p-3 shadow-lg border border-gray-200 transition-colors z-10 ${
                  currentIndex === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
                aria-label="Previous reviews"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex === maxIndex}
                className={`absolute right-0 top-1/2 -translate-y-1/2 ${isMobile ? 'translate-x-2' : 'translate-x-4'} bg-white rounded-full p-3 shadow-lg border border-gray-200 transition-colors z-10 ${
                  currentIndex === maxIndex 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
                aria-label="Next reviews"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* Dots Indicator */}
        {reviews.length > itemsPerView && totalDots > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: totalDots }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to position ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Review Counter */}
        {reviews.length > itemsPerView && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {currentIndex + 1}-{Math.min(currentIndex + itemsPerView, reviews.length)} of {reviews.length} reviews
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-12 space-y-4">
          {/* Add Review Button */}
          <div>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJP6ONgAZ7AjoR0D4RvoCov1w"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Star className="h-5 w-5" />
              <span>Write a Review</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
          
          {/* View All Reviews Link */}
          <div>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJP6ONgAZ7AjoR0D4RvoCov1w"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span>View all reviews on Google</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}