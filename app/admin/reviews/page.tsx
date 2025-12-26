"use client";
import { useState, useEffect } from "react";
import { ReviewService, CustomerReview } from "@/lib/review-services";
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MapPin, 
  Shield,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review?: CustomerReview;
  onSave: (review: Omit<CustomerReview, "id">) => void;
}

function ReviewModal({ isOpen, onClose, review, onSave }: ReviewModalProps) {
  const [formData, setFormData] = useState<{
    customerName: string;
    customerImage: string;
    rating: number;
    reviewText: string;
    location: string;
    verified: boolean;
    source: 'google' | 'website' | 'manual';
    isActive: boolean;
  }>({
    customerName: "",
    customerImage: "",
    rating: 5,
    reviewText: "",
    location: "",
    verified: true,
    source: "manual",
    isActive: true,
  });

  useEffect(() => {
    if (review) {
      setFormData({
        customerName: review.customerName,
        customerImage: review.customerImage || "",
        rating: review.rating,
        reviewText: review.reviewText,
        location: review.location || "",
        verified: review.verified,
        source: review.source,
        isActive: review.isActive,
      });
    } else {
      setFormData({
        customerName: "",
        customerImage: "",
        rating: 5,
        reviewText: "",
        location: "",
        verified: true,
        source: "manual",
        isActive: true,
      });
    }
  }, [review, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: review?.date || new Date().toISOString(),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {review ? "Edit Review" : "Add New Review"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Mumbai, India"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Image URL (Optional)
            </label>
            <Input
              value={formData.customerImage}
              onChange={(e) => setFormData({ ...formData, customerImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`p-1 ${
                    star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2">
                {formData.rating} star{formData.rating !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Text *
            </label>
            <textarea
              value={formData.reviewText}
              onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the review text..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as 'google' | 'website' | 'manual' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="google">Google</option>
                <option value="website">Website</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Verified</span>
              </label>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {review ? "Update Review" : "Add Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterSource, setFilterSource] = useState<string>("");
  const [showInactive, setShowInactive] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    review?: CustomerReview;
  }>({ isOpen: false });
  
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const fetchedReviews = await ReviewService.getAllReviewsForAdmin();
      setReviews(fetchedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch reviews",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async (reviewData: Omit<CustomerReview, "id">) => {
    try {
      if (modalState.review) {
        // Update existing review
        await ReviewService.updateReview(modalState.review.id, reviewData);
        addToast({
          title: "Success",
          description: "Review updated successfully",
          type: "success",
        });
      } else {
        // Add new review
        await ReviewService.addReview(reviewData);
        addToast({
          title: "Success",
          description: "Review added successfully",
          type: "success",
        });
      }
      
      setModalState({ isOpen: false });
      fetchReviews();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Failed to save review",
        type: "error",
      });
    }
  };

  const handleToggleStatus = async (reviewId: string, isActive: boolean) => {
    try {
      await ReviewService.toggleReviewStatus(reviewId, isActive);
      addToast({
        title: "Success",
        description: `Review ${isActive ? "activated" : "deactivated"} successfully`,
        type: "success",
      });
      fetchReviews();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Failed to update review status",
        type: "error",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await ReviewService.deleteReview(reviewId);
      addToast({
        title: "Success",
        description: "Review deleted successfully",
        type: "success",
      });
      fetchReviews();
    } catch (error: any) {
      addToast({
        title: "Error",
        description: error.message || "Failed to delete review",
        type: "error",
      });
    }
  };

  // Filter reviews based on search and filters
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === null || review.rating === filterRating;
    const matchesSource = !filterSource || review.source === filterSource;
    const matchesStatus = showInactive || review.isActive !== false;
    
    return matchesSearch && matchesRating && matchesSource && matchesStatus;
  });

  const stats = ReviewService.getReviewStats(reviews);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <Button
            onClick={() => setModalState({ isOpen: true })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Review
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.activeReviews}</div>
            <div className="text-sm text-gray-600">Active Reviews</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.sourceDistribution.google}</div>
            <div className="text-sm text-gray-600">Google Reviews</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reviews..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={filterRating || ""}
                onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sources</option>
                <option value="google">Google</option>
                <option value="website">Website</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Show Inactive</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        {review.customerImage ? (
                          <img 
                            src={review.customerImage} 
                            alt={review.customerName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-semibold text-sm">
                            {review.customerName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.customerName}
                        </div>
                        {review.location && (
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {review.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">{review.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.reviewText}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Badge variant={review.source === 'google' ? 'default' : 'secondary'}>
                        {review.source}
                      </Badge>
                      {review.verified && (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={review.isActive !== false ? 'default' : 'secondary'}>
                      {review.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalState({ isOpen: true, review })}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(review.id, !review.isActive)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {review.isActive !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No reviews found</div>
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false })}
        review={modalState.review}
        onSave={handleSaveReview}
      />
    </div>
  );
}