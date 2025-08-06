import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { Link } from 'react-router-dom';
import useBreakpoint from '../hooks/useBreakpoint';

const Banner = () => {
  const [discountProducts, setDiscountProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { get } = useApi();
  const breakpoint = useBreakpoint();
  
  // Determine how many products to show based on screen size  
  const productsPerPage = breakpoint === 'md' || breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl' ? 2 : 1;

  useEffect(() => {
    const fetchDiscountProducts = async () => {
      try {
        setLoading(true);
        const response = await get(`${import.meta.env.VITE_API_URL}/api/products/top-discounts-by-category`);
        if (response.ok) {
          const data = await response.json();
          setDiscountProducts(data);
        }
      } catch (error) {
        console.error('Error fetching discount products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscountProducts();
  }, []);

  // Calculate total pages based on products per page
  const totalPages = Math.ceil(discountProducts.length / productsPerPage);
  
  // Reset currentIndex if it's out of bounds when screen size changes
  useEffect(() => {
    if (currentIndex >= totalPages && totalPages > 0) {
      setCurrentIndex(0);
    }
  }, [totalPages, currentIndex]);
  
  useEffect(() => {
    if (totalPages > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          (prevIndex + 1) % totalPages
        );
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [totalPages]);
  
  // Get current products to display
  const getCurrentProducts = () => {
    const startIndex = currentIndex * productsPerPage;
    return discountProducts.slice(startIndex, startIndex + productsPerPage);
  };

  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= maxStars; i++) {
      if (i <= roundedRating) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<span key={i} className="text-yellow-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="w-full h-40 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading special offers...</div>
      </div>
    );
  }

  if (discountProducts.length === 0) {
    return (
      <div className="w-full h-40 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-r from-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl font-bold">Special offers coming soon!</div>
      </div>
    );
  }

  const currentProducts = getCurrentProducts();

  return (
    <div className="relative w-full h-40 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-r from-blue-800 via-blue-600 to-blue-900 overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full px-4 sm:px-6 lg:px-8">
        {/* Mobile: Single product layout */}
        <div className="md:hidden flex items-center justify-between h-full">
          {currentProducts[0] && (
            <>
              {/* Product information */}
              <div className="flex-1 text-white">
                <div className="mb-1">
                  <span className="text-xs sm:text-sm bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">
                    {currentProducts[0].product.discount_percentage}% OFF!
                  </span>
                </div>
                
                <h2 className="text-sm sm:text-lg font-bold mb-1 truncate">
                  {currentProducts[0].product.name}
                </h2>
                
                <p className="text-xs sm:text-sm opacity-90 mb-1">
                  Category: {currentProducts[0].category.name}
                </p>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs sm:text-sm line-through opacity-70">
                    ${Number(currentProducts[0].product.price).toFixed(2)}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-yellow-300">
                    ${Number(currentProducts[0].product.final_price).toFixed(2)}
                  </span>
                </div>
                
                <Link 
                  to={`/product/${currentProducts[0].product.id}`}
                  className="inline-block bg-white text-blue-700 px-3 py-1 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-gray-100 transition-colors"
                >
                  View Deal
                </Link>
              </div>

              {/* Product image */}
              <div className="flex-shrink-0 ml-4">
                <Link to={`/product/${currentProducts[0].product.id}`}>
                  <img
                    src={currentProducts[0].product.image_url || '/placeholder-image.jpg'}
                    alt={currentProducts[0].product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
                  />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Desktop: Two products layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 xl:gap-12 h-full items-center">
          {currentProducts.map((productData, index) => (
            <div key={productData.product.id} className="flex items-center space-x-2 xl:space-x-2 bg-black/10 rounded-lg p-3 xl:p-4">
              {/* Product information */}
              <div className="flex-1 text-white min-w-0">
                <div className="mb-1">
                  <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">
                    {productData.product.discount_percentage}% OFF!
                  </span>
                </div>
                
                <h2 className="text-lg xl:text-xl font-bold mb-1 truncate">
                  {productData.product.name}
                </h2>
                
                <p className="text-sm opacity-90 mb-1">
                  Category: {productData.category.name}
                </p>
                
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm line-through opacity-70">
                    ${Number(productData.product.price).toFixed(2)}
                  </span>
                  <span className="text-lg font-bold text-yellow-300">
                    ${Number(productData.product.final_price).toFixed(2)}
                  </span>
                </div>
                
                <Link 
                  to={`/product/${productData.product.id}`}
                  className="inline-block bg-white text-blue-700 px-3 py-1 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  View Deal
                </Link>
              </div>

              {/* Product image */}
              <div className="flex-shrink-0">
                <Link to={`/product/${productData.product.id}`}>
                  <img
                    src={productData.product.image_url || '/placeholder-image.jpg'}
                    alt={productData.product.name}
                    className="w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform"
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page indicators */}
      {totalPages > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      {totalPages > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === 0 ? totalPages - 1 : prev - 1
            )}
            className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-1 rounded-full transition-colors z-20 shadow-lg"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentIndex((prev) => 
              (prev + 1) % totalPages
            )}
            className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-1 rounded-full transition-colors z-20 shadow-lg"
          >
            <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default Banner;