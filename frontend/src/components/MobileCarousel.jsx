import React, { useRef, useState } from 'react';
import ItemHome from './ItemHome';

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
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
        onClick={() => goTo(current - 1)}
        disabled={current === 0}
        aria-label="Anterior"
        style={{ display: current === 0 ? 'none' : 'block' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      {/* Carrusel */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth w-full"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={handleScroll}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className="min-w-full snap-center flex-shrink-0"
            style={{ maxWidth: '100%' }}
          >
            <ItemHome
              title={product.name}
              price={product.price}
              thumbnail={product.image_url}
              description={product.description}
              category={category}
              brand={product.brand}
              rating={product.rating?.average || 0}
              ratingCount={product.rating?.count || 0}
            />
          </div>
        ))}
      </div>
      {/* Flecha derecha */}
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
        onClick={() => goTo(current + 1)}
        disabled={current === products.length - 1}
        aria-label="Siguiente"
        style={{ display: current === products.length - 1 ? 'none' : 'block' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
};

export default MobileCarousel; 