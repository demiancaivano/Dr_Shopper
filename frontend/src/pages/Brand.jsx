import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CardItem from '../components/CardItem';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

const Brand = () => {
  const { brandName } = useParams();
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cambiar el título de la página con el nombre de la marca
  usePageTitle(`Brand: ${brandName}`);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Obtener el id de la marca a partir del nombre
    fetch(`${API_BASE}/brands`)
      .then(res => res.json())
      .then(brands => {
        const found = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase());
        if (!found) {
          setError('Brand not found');
          setProductsByCategory({});
          setLoading(false);
          return;
        }
        const brand_id = found.id;
        // Ahora fetch de productos usando brand_id
        fetch(`${API_BASE}?brand_id=${brand_id}&per_page=100`)
          .then(res => res.json())
          .then(data => {
            const products = data.products || [];
            // Agrupar productos por categoría
            const grouped = {};
            products.forEach(product => {
              const cat = product.category || 'Other';
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(product);
            });
            setProductsByCategory(grouped);
            setLoading(false);
          })
          .catch(() => {
            setError('Error loading products');
            setLoading(false);
          });
      })
      .catch(() => {
        setError('Error loading brand list');
        setLoading(false);
      });
  }, [brandName]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">{brandName}</h1>
      {loading ? (
        <div className="text-center py-10">Loading products...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : Object.keys(productsByCategory).length === 0 ? (
        <div className="text-center py-10">No products found for this brand.</div>
      ) : (
        Object.entries(productsByCategory).map(([category, products]) => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">{category}</h2>
            <div className="grid gap-4 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-8 md:gap-y-12 w-full mb-2"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {products.map(product => (
                <CardItem
                  key={product.id}
                  id={product.id}
                  title={product.name}
                  price={Number(product.price)}
                  final_price={Number(product.final_price)}
                  discount_percentage={product.discount_percentage}
                  thumbnail={product.image_url}
                  description={product.description}
                  category={product.category}
                  brand={product.brand}
                  rating={product.rating?.average || 0}
                  ratingCount={product.rating?.count || 0}
                  imgClass=""
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Brand;