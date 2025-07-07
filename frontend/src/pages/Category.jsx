import React, { useEffect, useState } from 'react';
import Banner from '../components/Banner';
import CardItem from '../components/CardItem';
import { useParams } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;
const PER_PAGE = 6;

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ min: '', max: '', brand: '' });
  const [sort, setSort] = useState({ by: 'price', order: 'asc' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [pendingSort, setPendingSort] = useState(sort);

  // Obtener category_id a partir del nombre y hacer fetch de productos con filtros, orden y paginación
  useEffect(() => {
    setLoading(true);
    setError(null);
    setProducts([]);
    // Obtener todas las categorías
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(categories => {
        const found = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
        if (!found) {
          setError('Category not found');
          setProducts([]);
          setBrands([]);
          setLoading(false);
          return;
        }
        const category_id = found.id;
        // Construir query string
        const params = [
          `category_id=${category_id}`,
          `per_page=${PER_PAGE}`,
          `page=${page}`,
          `sort_by=${sort.by}`,
          `sort_order=${sort.order}`
        ];
        // Filtros de precio y marca
        if (filters.min !== '') params.push(`min_price=${filters.min}`);
        if (filters.max !== '') params.push(`max_price=${filters.max}`);
        if (filters.brand) params.push(`brand=${encodeURIComponent(filters.brand)}`);
        const url = `${API_BASE}?${params.join('&')}`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            setProducts(data.products || []);
            setTotalPages(data.pages || 1);
            // Extraer marcas únicas
            const uniqueBrands = Array.from(new Set((data.products || []).map(p => p.brand).filter(Boolean)));
            setBrands(uniqueBrands);
            setLoading(false);
          })
          .catch(() => {
            setError('Error loading products');
            setLoading(false);
          });
      })
      .catch(() => {
        setError('Error loading category list');
        setLoading(false);
      });
  }, [categoryName, filters.min, filters.max, filters.brand, sort.by, sort.order, page]);

  // Calcular el rango real de precios de los productos
  const precios = products.map(p => Number(p.price)).filter(p => !isNaN(p));
  const precioMin = precios.length ? Math.min(...precios) : 0;
  const precioMax = precios.length ? Math.max(...precios) : 1000;
  const min = filters.min !== '' ? Number(filters.min) : precioMin;
  const max = filters.max !== '' ? Number(filters.max) : precioMax;

  // Handler para el slider de rango doble
  const handleSliderChange = ([newMin, newMax]) => {
    setPendingFilters(prev => ({ ...prev, min: newMin, max: newMax }));
  };

  // Handler para filtros select y paginación
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'price_asc') setPendingSort({ by: 'price', order: 'asc' });
    else if (value === 'price_desc') setPendingSort({ by: 'price', order: 'desc' });
    else if (value === 'rating_desc') setPendingSort({ by: 'rating', order: 'desc' });
  };

  // Handler para paginación
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // Aplicar filtros en mobile
  const applyMobileFilters = () => {
    setFilters(pendingFilters);
    setSort(pendingSort);
    setPage(1);
    setShowMobileFilters(false);
  };

  // Render de los filtros (compartido entre sidebar y modal mobile)
  const FiltersContent = ({ filtersState, sortState, onFilterChange, onSortChange, onSliderChange, onApply, isMobile }) => (
    <div>
      <div className="mb-3">
        <label className="block text-sm mb-2 text-white">Price range</label>
        <div className="flex flex-col items-center w-full">
          <div className="w-full flex flex-row items-center justify-between mb-2">
            <span className="text-xs text-white">€{filtersState.min !== '' ? filtersState.min : precioMin}</span>
            <span className="text-xs text-white">€{filtersState.max !== '' ? filtersState.max : precioMax}</span>
          </div>
          <Slider
            range
            min={precioMin}
            max={precioMax}
            value={[
              filtersState.min !== '' ? Number(filtersState.min) : precioMin,
              filtersState.max !== '' ? Number(filtersState.max) : precioMax
            ]}
            onChange={onSliderChange}
            allowCross={false}
            trackStyle={[{ backgroundColor: '#60a5fa' }]}
            handleStyle={[
              { borderColor: '#60a5fa', backgroundColor: '#fff' },
              { borderColor: '#60a5fa', backgroundColor: '#fff' }
            ]}
            railStyle={{ backgroundColor: '#1e293b' }}
          />
          <div className="w-full flex justify-between mt-1">
            <span className="text-xs text-white">€{precioMin}</span>
            <span className="text-xs text-white">€{precioMax}</span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label className="block text-sm mb-1 text-white">Brand</label>
        <select
          name="brand"
          value={filtersState.brand}
          onChange={onFilterChange}
          className="w-full border rounded px-2 py-1 text-blue-900 bg-white focus:bg-white focus:border-blue-400"
        >
          <option value="">All</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-sm mb-1 text-white">Order by</label>
        <select
          name="sort"
          value={sortState.by === 'price' ? (sortState.order === 'asc' ? 'price_asc' : 'price_desc') : 'rating_desc'}
          onChange={onSortChange}
          className="w-full border rounded px-2 py-1 text-blue-900 bg-white focus:bg-white focus:border-blue-400"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating: High to Low</option>
        </select>
      </div>
      {isMobile && (
        <button
          className="w-full bg-blue-700 text-white py-2 rounded mt-4 font-semibold"
          onClick={onApply}
        >
          Apply filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 flex flex-col gap-6 mt-6">
      {/* Banner ocupa todo el ancho */}
      <h1 className="font-bold text-3xl text-center text-white">{categoryName}</h1>
      <div className="w-full mb-4">
        <Banner />
      </div>
      {/* Mobile: botón para mostrar filtros */}
      <div className="block lg:hidden mb-4">
        <button
          className="w-full bg-blue-900 text-white py-2 rounded font-semibold"
          onClick={() => {
            setPendingFilters(filters);
            setPendingSort(sort);
            setShowMobileFilters(true);
          }}
        >
          Show filters
        </button>
        {/* Modal/menú de filtros mobile */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-blue-900 rounded-lg shadow p-6 w-11/12 max-w-md relative">
              <button
                className="absolute top-2 right-2 text-white text-xl font-bold"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-lg font-semibold mb-4 text-white">Filters</h2>
              <FiltersContent
                filtersState={pendingFilters}
                sortState={pendingSort}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onSliderChange={handleSliderChange}
                onApply={applyMobileFilters}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
      {/* Layout principal: sidebar a la izquierda en desktop, filtros arriba en mobile */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Sidebar de filtros (solo visible en desktop) */}
        <aside className="hidden lg:block w-full lg:w-1/4 bg-blue-900 rounded-lg shadow p-4 mb-4 lg:mb-0 text-white" style={{ alignSelf: "flex-start" }}>
          <h2 className="text-lg font-semibold mb-4 text-white">Filters</h2>
          <FiltersContent
            filtersState={filters}
            sortState={sort}
            onFilterChange={e => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); setPage(1); }}
            onSortChange={e => { const value = e.target.value; if (value === 'price_asc') setSort({ by: 'price', order: 'asc' }); else if (value === 'price_desc') setSort({ by: 'price', order: 'desc' }); else if (value === 'rating_desc') setSort({ by: 'rating', order: 'desc' }); setPage(1); }}
            onSliderChange={([newMin, newMax]) => { setFilters(prev => ({ ...prev, min: newMin, max: newMax })); setPage(1); }}
            isMobile={false}
          />
        </aside>
        {/* Productos */}
        <main className="flex-1">
          {loading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-10">No products found for this category.</div>
          ) : products.length === 1 ? (
            <div className="flex justify-center w-full">
              <div style={{ maxWidth: 350 }}>
                <CardItem
                  key={products[0].id}
                  id={products[0].id}
                  title={products[0].name}
                  price={products[0].price}
                  thumbnail={products[0].image_url}
                  description={products[0].description}
                  category={categoryName}
                  brand={products[0].brand}
                  rating={products[0].rating?.average || 0}
                  ratingCount={products[0].rating?.count || 0}
                  imgClass="w-[200px] h-[200px]"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-8 gap-y-12 w-full"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                {products.map(product => (
                  <CardItem
                    key={product.id}
                    id={product.id}
                    title={product.name}
                    price={product.price}
                    thumbnail={product.image_url}
                    description={product.description}
                    category={categoryName}
                    brand={product.brand}
                    rating={product.rating?.average || 0}
                    ratingCount={product.rating?.count || 0}
                    imgClass="w-[200px] h-[200px]"
                  />
                ))}
              </div>
              {/* Controles de paginación */}
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-3 py-1 rounded bg-blue-900 text-white disabled:opacity-50"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="text-white font-semibold">Page {page} of {totalPages}</span>
                <button
                  className="px-3 py-1 rounded bg-blue-900 text-white disabled:opacity-50"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Category; 