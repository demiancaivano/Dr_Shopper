import React, { useEffect, useState } from 'react';

import CardItem from '../components/CardItem';
import RelatedProductCard from '../components/RelatedProductCard';
import MobileCarousel from '../components/MobileCarousel';
import { useParams } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import usePageTitle from '../hooks/usePageTitle';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;
const PER_PAGE = 6;

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ min: '', max: '', brands: [] });
  const [sort, setSort] = useState({ by: 'rating', order: 'desc' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(filters);
  const [pendingSort, setPendingSort] = useState(sort);
  const [allPrices, setAllPrices] = useState({ min: 0, max: 1000 });
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Cambiar el título de la página con el nombre de la categoría
  usePageTitle(`Category: ${categoryName}`);
  // Handler for slider (both desktop and mobile)
  const handleSliderChange = ([newMin, newMax]) => {
    setFilters(prev => ({ ...prev, min: newMin, max: newMax }));
    setPage(1);
  };

  // Handler for filters select and pagination
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  // Handler for sort select
  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'price_asc') setSort({ by: 'price', order: 'asc' });
    else if (value === 'price_desc') setSort({ by: 'price', order: 'desc' });
    else if (value === 'rating_desc') setSort({ by: 'rating', order: 'desc' });
    setPage(1);
  };

  // Handler for mobile slider (actualiza solo pendingFilters)
  const handleMobileSliderChange = ([newMin, newMax]) => {
    setPendingFilters(prev => ({ ...prev, min: newMin, max: newMax }));
  };

  // Handler for mobile filter change (actualiza solo pendingFilters)
  const handleMobileFilterChange = (e) => {
    const { name, value } = e.target;
    setPendingFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handler for mobile sort change (actualiza solo pendingSort)
  const handleMobileSortChange = (e) => {
    const value = e.target.value;
    if (value === 'price_asc') setPendingSort({ by: 'price', order: 'asc' });
    else if (value === 'price_desc') setPendingSort({ by: 'price', order: 'desc' });
    else if (value === 'rating_desc') setPendingSort({ by: 'rating', order: 'desc' });
  };

  // Reset filters and page only when category changes
  useEffect(() => {
    setFilters({ min: '', max: '', brands: [] });
    setPendingFilters({ min: '', max: '', brands: [] });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]);

  // Fetch products with filters, sort, and pagination
  useEffect(() => {
    setLoading(true);
    setError(null);
    setProducts([]);
    // Get all categories
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
        // Get price range of all products in the category (only once per category change)
        fetch(`${API_BASE}?category_id=${category_id}`)
          .then(res => res.json())
          .then(data => {
            const allPrices = (data.products || []).map(p => Number(p.price)).filter(p => !isNaN(p));
            const minAll = allPrices.length ? Math.min(...allPrices) : 0;
            const maxAll = allPrices.length ? Math.max(...allPrices) : 1000;
            setAllPrices({ min: minAll, max: maxAll });
            // Extract all unique brands from the category
            const uniqueAllBrands = Array.from(new Set((data.products || []).map(p => p.brand_id && p.brand ? JSON.stringify({id: p.brand_id, name: p.brand}) : null).filter(Boolean)))
              .map(str => JSON.parse(str));
            setAllBrands(uniqueAllBrands);
          });
        // Build query string
        const params = [
          `category_id=${category_id}`,
          `per_page=${PER_PAGE}`,
          `page=${page}`,
          `sort_by=${sort.by}`,
          `sort_order=${sort.order}`
        ];
        // Price and brand filters
        if (filters.min !== '') params.push(`min_price=${filters.min}`);
        if (filters.max !== '') params.push(`max_price=${filters.max}`);
        if (filters.brands && filters.brands.length > 0) {
          filters.brands.forEach(brandId => params.push(`brand_id=${brandId}`));
        }
        const url = `${API_BASE}?${params.join('&')}`;
        fetch(url)
          .then(res => res.json())
          .then(data => {
            setProducts(data.products || []);
            setTotalPages(data.pages || 1);
            // Extract unique brands (with id and name)
            const uniqueBrands = Array.from(new Set((data.products || []).map(p => p.brand_id && p.brand ? JSON.stringify({id: p.brand_id, name: p.brand}) : null).filter(Boolean)))
              .map(str => JSON.parse(str));
            setBrands(uniqueBrands);
            setLoading(false);
            
            // Fetch related products (from other categories, top rated)
            fetch(`${API_BASE}?sort_by=rating&sort_order=desc&per_page=8`)
              .then(res => res.json())
              .then(relatedData => {
                // Filter out products from current category and get 4 random ones
                const otherCategoryProducts = (relatedData.products || []).filter(p => p.category_id !== category_id);
                const shuffled = otherCategoryProducts.sort(() => 0.5 - Math.random());
                setRelatedProducts(shuffled.slice(0, 4));
              })
              .catch(() => {
                // If fails, just keep empty array
                setRelatedProducts([]);
              });
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
  }, [categoryName, filters.min, filters.max, filters.brands, sort.by, sort.order, page]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Function to handle page navigation
  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Clamp for slider values
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const min = filters.min !== '' ? clamp(Number(filters.min), allPrices.min, allPrices.max) : allPrices.min;
  const max = filters.max !== '' ? clamp(Number(filters.max), allPrices.min, allPrices.max) : allPrices.max;

  // Apply filters on mobile (solo actualiza sort y cierra modal)
  const applyMobileFilters = () => {
    setSort(pendingSort);
    setShowMobileFilters(false);
  };

  // Estado local temporal para el slider de desktop
  const [desktopPriceRange, setDesktopPriceRange] = useState([0, 1000]);
  // Estado local temporal para el slider de mobile
  const [mobilePriceRange, setMobilePriceRange] = useState([0, 1000]);

  // Sincronizar ambos sliders con allPrices cuando cambian
  useEffect(() => {
    if (
      typeof allPrices.min === 'number' &&
      typeof allPrices.max === 'number' &&
      allPrices.max > allPrices.min
    ) {
      setDesktopPriceRange([allPrices.min, allPrices.max]);
      setMobilePriceRange([allPrices.min, allPrices.max]);
    }
  }, [allPrices.min, allPrices.max, categoryName]);

  // Handler para aplicar el filtro de precios en desktop
  const applyDesktopPriceFilter = () => {
    setFilters(prev => ({ ...prev, min: desktopPriceRange[0], max: desktopPriceRange[1] }));
    setPage(1);
  };

  // Render filters (shared between sidebar and mobile modal)
  const FiltersContent = ({ filtersState, sortState, onFilterChange, onSortChange, onSliderChange, onSliderAfterChange, onApply, isMobile }) => (
    <div>
      <div className="mb-3">
        <label className="block text-sm mb-1 text-white">Brands</label>
        <div className="flex flex-col gap-1">
          {allBrands.map(brand => (
            <label key={brand.id} className="flex items-center gap-2 text-blue-900 bg-white rounded px-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                value={brand.id}
                checked={filtersState.brands && filtersState.brands.includes(brand.id.toString())}
                onChange={e => {
                  const checked = e.target.checked;
                  const value = e.target.value;
                  let newBrands = filtersState.brands ? [...filtersState.brands] : [];
                  if (checked) {
                    if (!newBrands.includes(value)) newBrands.push(value);
                  } else {
                    newBrands = newBrands.filter(b => b !== value);
                  }
                  onFilterChange({ target: { name: 'brands', value: newBrands } });
                }}
              />
              {brand.name}
            </label>
          ))}
        </div>
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
      <h1 className="font-bold text-3xl text-center text-white">{categoryName}</h1>
      {/* Mobile: button to show filters */}
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
        {/* Modal/menu for mobile filters */}
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
              {/* Slider de precios dentro del modal, usando estado temporal local */}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-white">Price range</label>
                {(typeof allPrices.min === 'number' && typeof allPrices.max === 'number' && allPrices.max > allPrices.min) && (
                  <Slider
                    range
                    min={Math.floor(allPrices.min)}
                    max={Math.ceil(allPrices.max)}
                    step={1}
                    value={mobilePriceRange.map(v => Math.round(v))}
                    onChange={vals => setMobilePriceRange(vals.map(v => Math.round(v)))}
                    allowCross={false}
                    trackStyle={[{ backgroundColor: '#60a5fa' }]}
                    handleStyle={[
                      { borderColor: '#60a5fa', backgroundColor: '#fff' },
                      { borderColor: '#60a5fa', backgroundColor: '#fff' }
                    ]}
                    railStyle={{ backgroundColor: '#1e293b' }}
                  />
                )}
                <div className="flex justify-between w-full max-w-md mt-2">
                  <span className="text-xs text-white">€{Math.round(mobilePriceRange[0])}</span>
                  <span className="text-xs text-white">€{Math.round(mobilePriceRange[1])}</span>
                </div>
              </div>
              <FiltersContent
                filtersState={pendingFilters}
                sortState={pendingSort}
                onFilterChange={handleMobileFilterChange}
                onSortChange={handleMobileSortChange}
                onSliderChange={handleMobileSliderChange}
                onSliderAfterChange={null}
                onApply={() => {
                  setFilters(prev => ({ ...prev, min: mobilePriceRange[0], max: mobilePriceRange[1] }));
                  setSort(pendingSort);
                  setPage(1);
                  setShowMobileFilters(false);
                }}
                isMobile={true}
              />
            </div>
          </div>
        )}
      </div>
      {/* Main layout: sidebar on the left on desktop, filters above on mobile */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Sidebar for filters (only visible on desktop) */}
        <aside className="hidden lg:block w-full lg:w-1/4 bg-blue-900 rounded-lg shadow p-4 mb-4 lg:mb-0 text-white" style={{ alignSelf: "flex-start" }}>
          <h2 className="text-lg font-semibold mb-4 text-white">Filters</h2>
          {/* Price range slider for desktop */}
          <div className="mb-4">
            <label className="block text-sm mb-2 text-white">Price range</label>
            {(typeof allPrices.min === 'number' && typeof allPrices.max === 'number' && allPrices.max > allPrices.min) && (
              <Slider
                range
                min={Math.floor(allPrices.min)}
                max={Math.ceil(allPrices.max)}
                step={1}
                value={desktopPriceRange.map(v => Math.round(v))}
                onChange={vals => setDesktopPriceRange(vals.map(v => Math.round(v)))}
                onAfterChange={vals => {
                  setFilters(prev => ({ ...prev, min: Math.round(vals[0]), max: Math.round(vals[1]) }));
                  setPage(1);
                }}
                allowCross={false}
                trackStyle={[{ backgroundColor: '#60a5fa' }]}
                handleStyle={[
                  { borderColor: '#60a5fa', backgroundColor: '#fff' },
                  { borderColor: '#60a5fa', backgroundColor: '#fff' }
                ]}
                railStyle={{ backgroundColor: '#1e293b' }}
              />
            )}
            <div className="flex justify-between w-full max-w-md mt-2">
              <span className="text-xs text-white">€{Math.round(desktopPriceRange[0])}</span>
              <span className="text-xs text-white">€{Math.round(desktopPriceRange[1])}</span>
            </div>
            {/* No apply button in desktop */}
          </div>
          <FiltersContent
            filtersState={filters}
            sortState={sort}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            onSliderChange={handleSliderChange}
            onSliderAfterChange={null}
            isMobile={false}
          />
        </aside>
        {/* Products */}
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
                  price={Number(products[0].price).toFixed(2)}
                  final_price={Number(products[0].final_price).toFixed(2)}
                  discount_percentage={products[0].discount_percentage}
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
                    price={Number(product.price)}
                    final_price={Number(product.final_price)}
                    discount_percentage={product.discount_percentage}
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
              {/* Pagination controls */}
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
      
      {/* Related products section */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Related products</h2>
          {/* Desktop: row of 4, Mobile: carousel */}
          <div className="hidden md:flex gap-4 w-full justify-center">
            {relatedProducts.map((prod) => (
              <div key={prod.id} className="flex-1 min-w-0 max-w-[280px]">
                <RelatedProductCard
                  id={prod.id}
                  title={prod.name}
                  price={Number(prod.price).toFixed(2)}
                  final_price={Number(prod.final_price).toFixed(2)}
                  discount_percentage={prod.discount_percentage}
                  thumbnail={prod.image_url}
                  brand={prod.brand}
                  rating={prod.rating?.average || 0}
                  ratingCount={prod.rating?.count || 0}
                  stock={prod.stock || 99}
                />
              </div>
            ))}
          </div>
          <div className="block md:hidden">
            <MobileCarousel products={relatedProducts.map(prod => ({
              ...prod,
              price: Number(prod.price).toFixed(2),
              final_price: Number(prod.final_price).toFixed(2),
            }))} category="Related" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Category; 