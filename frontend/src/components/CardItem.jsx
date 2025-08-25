import React, { useContext } from 'react';
import '../styles/CardItem.css';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';

const CardItem = ({ id, title, price, final_price, discount_percentage, thumbnail, description, category, rating = 0, brand, ratingCount = 0, imgClass = '', showDescription = true, showAddToCart = true, carousel = false, stock = 99, isHomeGrid = false }) => {
  const { state: cartState, addItem, removeItem } = useContext(CartContext);
  // rating debe ser un número entre 0 y 5 (puede ser decimal)
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    const roundedRating = Math.round(rating * 2) / 2; // redondear al 0.5 más cercano
    for (let i = 1; i <= maxStars; i++) {
      if (i <= roundedRating) {
        stars.push(<span key={i} className="text-yellow-400">&#9733;</span>); // estrella llena
      } else if (i - 0.5 === roundedRating) {
        stars.push(<span key={i} className="text-yellow-400">&#189;</span>); // media estrella (personalizar si es necesario)
      } else {
        stars.push(<span key={i} className="text-gray-300">&#9733;</span>); // estrella vacía
      }
    }
    return stars;
  };

  const isMinimal = !showDescription && !showAddToCart;
  const inCart = cartState.items.some(item => item.productId === id);

  const handleAddToCart = () => {
    if (!inCart && stock > 0) {
      addItem({
        productId: id,
        name: title,
        price: hasDiscount ? finalPriceNum : priceNum,
        image_url: thumbnail,
        quantity: 1,
        stock: stock
      });
    }
  };

  const handleRemoveFromCart = () => {
    if (inCart) {
      removeItem(id);
    }
  };

  // Determinar si hay descuento
  const finalPriceNum = Number(final_price) || 0;
  const priceNum = Number(price) || 0;
  const hasDiscount = typeof discount_percentage === 'number' && discount_percentage > 0 && finalPriceNum < priceNum && finalPriceNum > 0;

  return (
    <div
      className={`bg-mariner-100 card-item rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center ${carousel ? 'p-2 min-h-[280px] h-full carousel-mode' : isMinimal ? 'p-3 min-h-[180px] max-h-[220px]' : 'p-2 sm:p-3 md:p-4 pb-1 sm:pb-2 min-h-[320px] sm:min-h-[380px] md:min-h-[420px] lg:min-h-[480px] 2xl:h-[520px]'} ${isHomeGrid ? 'home-grid-mode' : ''}`}
      style={carousel ? { fontSize: '0.93rem' } : {}}
    >
      <Link to={`/product/${id}`}>
        <img
          src={thumbnail}
          alt={title}
          className={`carditem-img ${carousel ? 'w-[200px] h-[200px]' : 'w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] md:w-[120px] md:h-[120px] lg:w-[120px] lg:h-[120px]'}`}
          sizes={carousel ? '200px' : '(max-width: 640px) 160px, (max-width: 768px) 200px, 120px'}
        />
      </Link>
      
      {/* Título - altura controlada por CSS */}
      <div className="flex items-center justify-center w-full mb-1 sm:mb-2">
        <h2 className={`font-bold text-mariner-900 text-center ${carousel ? 'text-lg' : 'text-lg sm:text-xl'} leading-tight break-words line-clamp-2`}>
          <Link to={`/product/${id}`} className="hover:underline">{title}</Link>
        </h2>
      </div>

      {/* Marca - altura fija */}
      <div className={`${carousel ? 'h-4' : 'h-4 sm:h-6'} flex items-center justify-center w-full mb-1`}>
        {brand && (
                      <span className="text-mariner-900 text-sm text-center truncate w-full">
            <Link to={`/brand/${encodeURIComponent(brand)}`} className="hover:underline">
              {brand}
            </Link>
          </span>
        )}
      </div>

      {/* Rating - altura fija */}
      <div className={`${carousel ? 'h-8 sm:h-10' : 'h-8 sm:h-12'} flex flex-col items-center justify-start w-full mb-1 sm:mb-2`}>
        <div className="flex items-center gap-1 mb-1">
          {renderStars(rating)}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-mariner-900 text-sm">
            {rating.toFixed(1)}<span className="text-xs">/ 5</span>
          </span>
          <span className="text-mariner-900 text-xs">({ratingCount})</span>
        </div>
      </div>

      {/* Descripción - ocupa el espacio restante pero con altura controlada */}
      {showDescription && (
        <div className={`${carousel ? 'flex-0' : 'flex-1'} flex items-start justify-center w-full mb-2 sm:mb-4 min-h-0`}>
          <p className={`text-mariner-900 text-center ${carousel ? 'text-sm' : 'text-sm'} overflow-hidden`}>
            {description}
          </p>
        </div>
      )}

      {/* Precios - abajo de todo */}
      <div className={`flex flex-col items-center justify-center w-full ${carousel ? 'mt-2 h-16' : 'mt-auto'} md:items-center md:justify-center md:gap-0 min-h-0 px-2`}>
        {hasDiscount ? (
          <>
            {/* Precio tachado y descuento en la misma fila */}
            <div className="flex flex-row items-center gap-2 justify-center min-h-0 mb-1">
              <span className="text-mariner-900 text-center text-base sm:text-lg font-semibold mb-0 line-through opacity-60">€{priceNum.toFixed(2)}</span>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">-{discount_percentage}%</span>
            </div>
            {/* Precio final en línea separada */}
            <span className="text-red-600 text-center text-lg sm:text-xl font-bold mb-0">€{finalPriceNum.toFixed(2)}</span>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-mariner-900 text-center text-base sm:text-lg font-semibold mb-0 mr-1">€{priceNum.toFixed(2)}</span>
          </div>
        )}
        {showAddToCart && (
          <div className="w-full flex justify-center mt-1 sm:mt-2 mb-1">
            {inCart ? (
              <button
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-1 text-sm rounded-md font-semibold shadow cursor-pointer"
                title="Remove from cart"
                onClick={handleRemoveFromCart}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={carousel ? 'h-4 w-4' : 'h-5 w-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                In Cart
              </button>
            ) : (
              <button
                className="flex items-center justify-center gap-1 bg-blue-950 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 transition-colors font-semibold shadow"
                title="Add to cart"
                onClick={handleAddToCart}
                disabled={stock <= 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
                </svg>
                <span className="text-lg leading-none">+</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardItem;