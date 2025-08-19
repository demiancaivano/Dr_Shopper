import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

const ProductReviews = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState('helpful');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterRating, setFilterRating] = useState('all');
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { state: authState } = useContext(AuthContext);

  // Cambiar el título de la página con el nombre del producto
  usePageTitle(product?.name ? `Reviews: ${product.name}` : 'Product Reviews');

  const PER_PAGE = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch product details
    fetch(`${API_BASE}/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      })
      .catch(() => {
        setError('Error loading product');
      });

    // Fetch reviews with pagination and filters
    const params = [
      `per_page=${PER_PAGE}`,
      `page=${currentPage}`,
      `sort_by=${sortBy}`,
      `sort_order=${sortOrder}`
    ];

    if (filterRating !== 'all') {
      params.push(`rating=${filterRating}`);
    }

    fetch(`${API_BASE}/${id}/reviews?${params.join('&')}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setTotalPages(data.pages || 1);
        setTotalReviews(data.stats?.total_reviews || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading reviews');
        setLoading(false);
      });
  }, [id, currentPage, sortBy, sortOrder, filterRating]);

  // Cargar el estado inicial de likes del usuario
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetch(`${import.meta.env.VITE_API_URL}/api/products/reviews/user/liked`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Failed to fetch liked reviews');
        })
        .then(data => {
          setLikedReviews(new Set(data.liked_review_ids || []));
        })
        .catch(() => {
          // Silently fail - user will still be able to like reviews
        });
    }
  }, [authState.isAuthenticated]);

  const handleLikeReview = async (reviewId, currentHelpfulCount) => {
    if (!authState.isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? { ...review, is_helpful: data.helpful_count }
              : review
          )
        );

        setLikedReviews(prev => {
          const newSet = new Set(prev);
          if (data.action === 'liked') {
            newSet.add(reviewId);
          } else {
            newSet.delete(reviewId);
          }
          return newSet;
        });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error marking review as helpful');
      }
    } catch (error) {
      alert('Error marking review as helpful');
    }
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'helpful_desc') {
      setSortBy('helpful');
      setSortOrder('desc');
    } else if (value === 'helpful_asc') {
      setSortBy('helpful');
      setSortOrder('asc');
    } else if (value === 'rating_desc') {
      setSortBy('rating');
      setSortOrder('desc');
    } else if (value === 'rating_asc') {
      setSortBy('rating');
      setSortOrder('asc');
    } else if (value === 'date_desc') {
      setSortBy('creation_date');
      setSortOrder('desc');
    } else if (value === 'date_asc') {
      setSortBy('creation_date');
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterRating(e.target.value);
    setCurrentPage(1);
  };

  const ReviewCard = ({ review }) => {
    const isLiked = likedReviews.has(review.id);
    
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'}>&#9733;</span>
          ))}
          <span className="text-sm text-gray-600">{review.rating} / 5</span>
          {review.is_verified_purchase && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified purchase</span>
          )}
        </div>
        
        {review.title && (
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{review.title}</h3>
        )}
        
        <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>By {review.user_name || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(review.creation_date).toLocaleDateString()}</span>
          </div>
          
          <button
            onClick={() => handleLikeReview(review.id, review.is_helpful)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
              isLiked 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isLiked ? 'Remove like' : 'Mark as helpful'}
          >
            <svg 
              className={`w-4 h-4 ${isLiked ? 'text-blue-600' : 'text-gray-500'}`} 
              fill={isLiked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{review.is_helpful || 0} helpful</span>
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-10">Loading reviews...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!product) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to={`/product/${id}`}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to product
          </Link>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          {product.image_url && (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
            <p className="text-gray-600">All reviews ({totalReviews})</p>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by rating</label>
            <select 
              value={filterRating} 
              onChange={handleFilterChange}
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select 
              value={`${sortBy}_${sortOrder}`} 
              onChange={handleSortChange}
              className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="helpful_desc">Most helpful</option>
              <option value="helpful_asc">Least helpful</option>
              <option value="rating_desc">Highest rating</option>
              <option value="rating_asc">Lowest rating</option>
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No reviews found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {totalPages > 1 && (
        <div className="text-center text-sm text-gray-600 mb-4">
          Showing {((currentPage - 1) * PER_PAGE) + 1} to {Math.min(currentPage * PER_PAGE, totalReviews)} of {totalReviews} reviews
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            {/* First page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Previous page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                // Adjust start if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                // Show first page if not visible
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                    );
                  }
                }
                
                // Show visible pages
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`px-3 py-2 border rounded-md text-sm ${
                        i === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Show last page if not visible
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                    );
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            {/* Next page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign in to continue</h3>
            <p className="text-gray-600 mb-6">
              To mark reviews as helpful, you need to be registered and signed in.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <Link
                to="/login"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                onClick={() => setShowLoginModal(false)}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 