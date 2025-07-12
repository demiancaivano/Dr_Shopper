import React, { useRef, useState } from 'react';
import CardItem from './CardItem';

const MobileCarousel = ({ products = [], category }) => {
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);

  const goTo = (idx) => {
    if (idx < 0 || idx >= products.length) return;
    setCurrent(idx);
    // Scroll al producto seleccionado
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: idx * carouselRef.current.offsetWidth,
        behavior: 'smooth',
      });
    }
  };

  // Sincroniza el índice al hacer scroll manual
  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const idx = Math.round(scrollLeft / width);
    setCurrent(idx);
  };

  return (
    <div className="relative w-full">
      {/* Flecha izquierda */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-mariner-900/90 hover:bg-mariner-900 text-white rounded-full p-2 shadow-lg transition-all duration-200"
        onClick={() => goTo(current - 1)}
        disabled={current === 0}
        aria-label="Anterior"
        style={{ display: current === 0 ? 'none' : 'block' }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      {/* Carrusel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full h-full"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={handleScroll}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className="min-w-full snap-center flex-shrink-0 h-full"
            style={{ maxWidth: '100%' }}
          >
            <CardItem
              id={product.id}
              title={product.name}
              price={product.price}
              thumbnail={product.image_url}
              description={product.description}
              category={category}
              brand={product.brand}
              rating={product.rating?.average || 0}
              ratingCount={product.rating?.count || 0}
              showDescription={false}
              showAddToCart={false}
              carousel={true}
            />
          </div>
        ))}
      </div>
      {/* Flecha derecha */}
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-mariner-900/90 hover:bg-mariner-900 text-white rounded-full p-2 shadow-lg transition-all duration-200"
        onClick={() => goTo(current + 1)}
        disabled={current === products.length - 1}
        aria-label="Siguiente"
        style={{ display: current === products.length - 1 ? 'none' : 'block' }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
};

export default MobileCarousel; 