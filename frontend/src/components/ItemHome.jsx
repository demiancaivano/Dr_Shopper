import React from 'react';
import { Link } from 'react-router-dom';

const ItemHome = ({ title, price, thumbnail, description, category, rating = 0, brand, ratingCount = 0 }) => {
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

  return (
    <div className="bg-mariner-100 rounded-lg p-4 pb-1 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col items-center justify-start min-h-[430px] md:min-h-[490px] lg:min-h-[460px] 2xl:min-h-[480px] 2xl:max-h-[480px]">
      <img
        src={thumbnail}
        alt={title}
        className="w-full max-w-[120px] h-auto object-cover rounded-md mb-2"
      />
      <h2 className="text-xl font-bold text-mariner-900 text-center mb-1">{title}</h2>
      {brand && (
        <span className="text-mariner-900 text-sm mb-1">{`Marca: ${brand}`}</span>
      )}
      <div className="flex items-center mb-1 gap-2 w-full justify-center flex-wrap">
        {renderStars(rating)}
        <span className="text-mariner-900 text-sm flex items-center gap-1">
          {rating.toFixed(1)}<span className="text-xs">/ 5</span>
        </span>
        <span className="text-mariner-900 text-xs ml-1 whitespace-nowrap">({ratingCount})</span>
      </div>
      <p className="text-mariner-900 text-center text-sm mb-2 h-full overflow-hidden text-ellipsis item-description">{description}</p>
      <div className="flex flex-col justify-end h-full w-full">
        <span className="text-lg font-semibold text-mariner-900 mb-2 text-center">€{price}</span>
        <button
          className="flex items-center gap-2 bg-blue-950 text-white px-3 py-1 rounded-md mt-1 hover:bg-blue-700 transition-colors text-sm font-semibold shadow mx-auto"
          title="Add to cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.85-1.53L17 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
          </svg>
          <span className="text-lg leading-none">+</span>
          <span className="hidden sm:inline"></span>
        </button>
        {category && (
          <Link
            to={`/category/${category}`}
            className="text-mariner-900 underline text-sm mt-1 hover:text-blue-accent transition-colors w-full flex items-center justify-center text-center min-h-[2.5rem]"
          >
            {`See more in ${category}`}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ItemHome;