import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import CartContext from '../context/CartContext';

const RelatedProductCard = ({ 
  id, 
  title, 
  price, 
  final_price, 
  discount_percentage, 
  thumbnail, 
  brand, 
  rating = 0, 
  ratingCount = 0,
  stock = 99 
}) => {
  const { state: cartState, addItem, removeItem } = useContext(CartContext);

  // Función para renderizar estrellas
  const renderStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    const roundedRating = Math.round(rating * 2) / 2;
    for (let i = 1; i <= maxStars; i++) {
      if (i <= roundedRating) {
        stars.push(<span key={i} className="text-yellow-400">&#9733;</span>);
      } else if (i - 0.5 === roundedRating) {
        stars.push(<span key={i} className="text-yellow-400">&#189;</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">&#9733;</span>);
      }
    }
    return stars;
  };

  // Lógica de precios y descuentos
  const finalPriceNum = Number(final_price) || 0;
  const priceNum = Number(price) || 0;
  const hasDiscount = typeof discount_percentage === 'number' && 
                     discount_percentage > 0 && 
                     finalPriceNum < priceNum && 
                     finalPriceNum > 0;

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

  return (
    <div className="bg-mariner-100 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col p-3 h-full min-h-[300px]">
      {/* Imagen del producto */}
      <Link to={`/product/${id}`} className="flex justify-center mb-3">
        <img
          src={thumbnail}
          alt={title}
          className="w-[120px] h-[120px] object-cover rounded"
          sizes="120px"
        />
      </Link>
      
      {/* Título */}
      <div className="mb-2 flex-shrink-0">
        <h3 className="font-semibold text-mariner-900 text-center text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
          <Link to={`/product/${id}`} className="hover:underline">{title}</Link>
        </h3>
      </div>

      {/* Marca */}
      <div className="mb-2 flex-shrink-0 h-5 flex items-center justify-center">
        {brand && (
          <span className="text-mariner-900 text-xs text-center truncate">
            <Link to={`/brand/${encodeURIComponent(brand)}`} className="hover:underline">
              {brand}
            </Link>
          </span>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3 flex-shrink-0 h-8 flex flex-col items-center justify-center">
        <div className="flex items-center gap-1 mb-1">
          {renderStars(rating)}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-mariner-900 text-xs">
            {rating.toFixed(1)}<span className="text-xs">/ 5</span>
          </span>
          <span className="text-mariner-900 text-xs">({ratingCount})</span>
        </div>
      </div>

      {/* Espacio flexible para empujar el precio hacia abajo */}
      <div className="flex-1"></div>

      {/* Precios */}
      <div className="flex flex-col items-center justify-center mb-3 flex-shrink-0">
        {hasDiscount ? (
          <>
            <div className="flex items-center gap-2 justify-center mb-1">
              <span className="text-mariner-900 text-sm line-through opacity-60">€{priceNum.toFixed(2)}</span>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded">-{discount_percentage}%</span>
            </div>
            <span className="text-red-600 text-base font-bold">€{finalPriceNum.toFixed(2)}</span>
          </>
        ) : (
          <span className="text-mariner-900 text-sm font-semibold">€{priceNum.toFixed(2)}</span>
        )}
      </div>

      {/* Botón de añadir al carrito */}
      <div className="flex justify-center flex-shrink-0">
        {inCart ? (
          <button
            className="flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-1.5 text-xs rounded-md font-semibold shadow cursor-pointer hover:bg-green-700 transition-colors"
            title="Remove from cart"
            onClick={handleRemoveFromCart}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            In cart
          </button>
        ) : (
          <button
            className="flex items-center justify-center gap-1 bg-blue-950 text-white px-3 py-1.5 text-xs rounded-md hover:bg-blue-700 transition-colors font-semibold shadow disabled:opacity-50"
            title="Add to cart"
            onClick={handleAddToCart}
            disabled={stock <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011 1h5a1 1 0 011 1v7" />
            </svg>
            <span className="text-base leading-none">+</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RelatedProductCard;