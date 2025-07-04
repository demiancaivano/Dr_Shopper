import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import ItemHome from '../components/ItemHome';
import useBreakpoint from '../hooks/useBreakpoint';
import MobileCarousel from '../components/MobileCarousel'; // Added import for MobileCarousel

// URL base del backend
const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

function Home() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const breakpoint = useBreakpoint();

  // Configuración de bloques por fila según breakpoint
  let blocksPerRow = 4;
  if (breakpoint === 'lg') {
    blocksPerRow = 3;
  } else if (breakpoint === 'md') {
    blocksPerRow = 2;
  } else if (breakpoint === 'sm' || breakpoint === 'xs') {
    blocksPerRow = 1;
  }

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        // Elegir cuántos productos mostrar según breakpoint
        const perPage = (breakpoint === 'xs' || breakpoint === 'sm') ? 4 : 2;
        const fetches = data.map(category =>
          fetch(`${API_BASE}?category_id=${category.id}&per_page=${perPage}`)
            .then(res => res.json())
            .then(prodData => ({
              categoryId: category.id,
              categoryName: category.name,
              products: prodData.products || []
            }))
        );
        Promise.all(fetches).then(results => {
          const grouped = {};
          results.forEach(({ categoryName, products }) => {
            grouped[categoryName] = products;
          });
          setProductsByCategory(grouped);
          setLoading(false);
        });
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Prepara los bloques: cada bloque es una categoría con hasta 2 productos
  const blocks = categories.map(category => ({
    id: category.id,
    name: category.name,
    products: productsByCategory[category.name] || []
  }));

  return (
    <div>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center mb-12">
        <div className="w-full mb-4">
          <Banner />
        </div>
        <h1 className="text-3xl font-bold mt-2 mb-4">Featured Products</h1>
        <div
          className="grid gap-8 gap-y-12 w-full"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
        >
          {blocks.map(block => (
            <div key={block.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-200 h-full mb-2">
              <h2 className="text-xl font-semibold text-mariner-900 mb-2 text-center">{block.name}</h2>
              <div className="w-full">
                {/* Mobile: Carrusel con flechas y scroll táctil */}
                <div className="block sm:hidden">
                  <MobileCarousel products={block.products} category={block.name} />
                </div>
                {/* Desktop: Grid de dos columnas como antes */}
                <div className="hidden sm:grid grid-cols-2 gap-4 w-full justify-center">
                  {block.products.map(product => (
                    <ItemHome
                      key={product.id}
                      title={product.name}
                      price={product.price}
                      thumbnail={product.image_url}
                      description={product.description}
                      category={block.name}
                      brand={product.brand}
                      rating={product.rating?.average || 0}
                      ratingCount={product.rating?.count || 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home; 