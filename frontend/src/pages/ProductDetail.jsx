import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import CardItem from '../components/CardItem';
import MobileCarousel from '../components/MobileCarousel';
import AuthContext from '../context/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [related, setRelated] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [likedReviews, setLikedReviews] = useState(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { state: authState } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Fetch product
    fetch(`${API_BASE}/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setProduct(data);
          // Set main image (first of images array, or image_url)
          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0]);
          } else if (data.image_url) {
            setMainImage(data.image_url);
          } else {
            setMainImage(null);
          }
          // Fetch reviews (top 3 by helpful)
          fetch(`${API_BASE}/${id}/reviews?sort_by=helpful&sort_order=desc&per_page=3`)
            .then(res => res.json())
            .then(rdata => {
              setReviews(rdata.reviews || []);
              setReviewsCount(rdata.stats?.total_reviews || 0);
            });
          // Fetch related products (same category, exclude current)
          if (data.category_id) {
            fetch(`${API_BASE}?category_id=${data.category_id}&per_page=8`)
              .then(res => res.json())
              .then(rdata => {
                const rel = (rdata.products || []).filter(p => p.id !== data.id).slice(0, 4);
                setRelated(rel);
              });
          }
        } else {
          setError('Product not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading product');
        setLoading(false);
      });
  }, [id]);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar el estado local de reviews
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? { ...review, is_helpful: data.helpful_count }
              : review
          )
        );

        // Actualizar el estado de likes basado en la acción del backend
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

  if (loading) return <div className="text-center py-10">Loading product...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!product) return null;

  // Galería de imágenes
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.image_url ? [product.image_url] : []);

  // ReviewCard para mostrar una review individual
  const ReviewCard = ({ review }) => {
    const isLiked = likedReviews.has(review.id);
    
    return (
      <div className="bg-white rounded-lg shadow p-4 flex flex-col h-full border border-blue-100">
        <div className="flex items-center gap-2 mb-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-300'}>&#9733;</span>
          ))}
          <span className="text-xs text-blue-900">{review.rating} / 5</span>
          {review.is_verified_purchase && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified purchase</span>}
        </div>
        <div className="font-semibold text-blue-900">{review.title}</div>
        <div className="text-blue-900 text-sm mb-1">{review.comment}</div>
        <div className="flex items-center justify-between text-xs text-blue-900 mt-auto">
          <div className="flex items-center gap-2">
            <span>By {review.user_name || 'User'}</span>
            <span>•</span>
            <span>{new Date(review.creation_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLikeReview(review.id, review.is_helpful)}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
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
              <span>{review.is_helpful || 0}</span>
            </button>
                  </div>
      </div>
      
      {/* Modal for non-logged in users */}
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

  return (
    <div className="container mx-auto px-4 flex flex-col gap-8 mt-6">
      {/* Product main info */}
      <div className="flex flex-col md:flex-row gap-8 bg-blue-900 rounded-lg shadow p-6 text-white">
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Main image */}
          {mainImage && (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full max-w-xs md:max-w-[350px] md:w-[350px] h-[350px] rounded-lg bg-white p-2 mb-3 object-cover object-center"
              style={{
                width: '100%',
                maxWidth: '100vw',
                height: '350px',
                aspectRatio: '1/1',
                objectFit: 'cover',
                objectPosition: 'center',
                background: '#fff',
                display: 'block',
              }}
            />
          )}
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-1">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className={`w-16 h-16 object-cover rounded border-2 cursor-pointer ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.brand && (
            <div className="mb-1">
              Brand: <Link to={`/brand/${encodeURIComponent(product.brand)}`} className="underline text-blue-200">{product.brand}</Link>
            </div>
          )}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-semibold">€{product.price}</span>
            <span className="text-sm">Stock: {product.stock > 0 ? product.stock : 'Out of stock'}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            {/* Render stars similar to CardItem */}
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(product.rating?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}>&#9733;</span>
            ))}
            <span className="text-sm">{(product.rating?.average || 0).toFixed(1)} / 5</span>
            <span className="text-xs">({reviewsCount})</span>
          </div>
          <p className="mb-2 text-white/90">{product.description}</p>
          <button className="bg-blue-700 text-white px-4 py-2 rounded font-semibold w-fit mt-2 hover:bg-blue-600 transition">Add to cart</button>
        </div>
      </div>
      {/* Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Most relevant reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-blue-900">No reviews yet.</div>
        ) : (
          <>
            {/* Desktop: grid de 3 */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
            {/* Mobile: carrousel de a una */}
            <div className="block md:hidden w-full overflow-x-auto">
              <div className="flex gap-4 w-full" style={{scrollSnapType: 'x mandatory'}}>
                {reviews.map((review) => (
                  <div key={review.id} className="min-w-full snap-center">
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        <div className="flex justify-end mt-4">
          <Link to={`/product/${id}/reviews`} className="text-blue-700 font-semibold hover:underline">
            Show all reviews ({reviewsCount})
          </Link>
        </div>
      </div>
      {/* Related products */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-white">Related products</h2>
        {/* Desktop: row of 4, Mobile: carousel */}
        <div className="hidden md:flex gap-4 w-full">
          {related.map((prod) => (
            <div key={prod.id} className="flex-1 min-w-0 max-w-[280px]">
              <CardItem
                id={prod.id}
                title={prod.name}
                price={prod.price}
                thumbnail={prod.image_url}
                description={prod.description}
                category={prod.category}
                brand={prod.brand}
                rating={prod.rating?.average || 0}
                ratingCount={prod.rating?.count || 0}
                showDescription={false}
                showAddToCart={false}
                compact={true}
              />
            </div>
          ))}
        </div>
        <div className="block md:hidden">
          <MobileCarousel products={related} category={product.category} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 