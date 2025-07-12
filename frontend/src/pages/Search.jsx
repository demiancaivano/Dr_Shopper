import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CardItem from '../components/CardItem';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;
const PER_PAGE = 12;

const Search = () => {
  const { query } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('rating_desc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [pendingSortBy, setPendingSortBy] = useState('rating_desc');
  // Slider states
  const [desktopPriceRange, setDesktopPriceRange] = useState([0, 1000]);
  const [mobilePriceRange, setMobilePriceRange] = useState([0, 1000]);
  // Rango global de precios para el slider
  const [globalPriceRange, setGlobalPriceRange] = useState([0, 1000]);

  // Calcular el rango global de precios solo cuando cambia el query
  useEffect(() => {
    if (!query) return;
    fetch(`${API_BASE}?search=${encodeURIComponent(query)}&per_page=1000`)
      .then(res => res.json())
      .then(data => {
        const allPrices = (data.products || []).map(p => Number(p.price)).filter(p => !isNaN(p));
        const minAll = allPrices.length ? Math.min(...allPrices) : 0;
        const maxAll = allPrices.length ? Math.max(...allPrices) : 1000;
        setGlobalPriceRange([minAll, maxAll]);
        setPriceRange([minAll, maxAll]);
        setDesktopPriceRange([minAll, maxAll]);
        setMobilePriceRange([minAll, maxAll]);
      });
  }, [query]);

  // Parse sort parameters
  const getSortParams = () => {
    switch (sortBy) {
      case 'price_asc':
        return { sort_by: 'price', sort_order: 'asc' };
      case 'price_desc':
        return { sort_by: 'price', sort_order: 'desc' };
      case 'rating_desc':
      default:
        return { sort_by: 'rating', sort_order: 'desc' };
    }
  };

  // Fetch search results (productos filtrados)
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    const sortParams = getSortParams();
    const params = [
      `search=${encodeURIComponent(query)}`,
      `per_page=${PER_PAGE}`,
      `page=${currentPage}`,
      `sort_by=${sortParams.sort_by}`,
      `sort_order=${sortParams.sort_order}`,
      `min_price=${priceRange[0]}`,
      `max_price=${priceRange[1]}`
    ];
    fetch(`${API_BASE}?${params.join('&')}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setTotalPages(data.pages || 1);
        setTotalResults(data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Error loading search results');
        setLoading(false);
      });
  }, [query, currentPage, priceRange, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [priceRange, sortBy]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Sincronizar ambos sliders con globalPriceRange cuando cambian
  useEffect(() => {
    if (
      typeof globalPriceRange[0] === 'number' &&
      typeof globalPriceRange[1] === 'number' &&
      globalPriceRange[1] > globalPriceRange[0]
    ) {
      setDesktopPriceRange([globalPriceRange[0], globalPriceRange[1]]);
      setMobilePriceRange([globalPriceRange[0], globalPriceRange[1]]);
    }
  }, [globalPriceRange.min, globalPriceRange.max, query]);

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Render filters content (shared between sidebar and mobile modal)
  const FiltersContent = ({ sortByState, onSortChange, onApply, isMobile }) => (
    <div>
      <div className="mb-3">
        <label className="block text-sm mb-1 text-white">Order by</label>
        <select
          name="sort"
          value={sortByState}
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

  if (!query) {
    return (
      <div className="min-h-screen bg-blue-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Search</h1>
            <p>Enter a search term to find products.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/"
              className="text-blue-300 hover:text-blue-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-blue-200">Results for "{query}"</p>
        </div>

        {/* Mobile: button to show filters */}
        <div className="block lg:hidden mb-4">
          <button
            className="w-full bg-blue-900 text-white py-2 rounded font-semibold"
            onClick={() => {
              setMobilePriceRange(priceRange);
              setPendingSortBy(sortBy);
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
                  {(typeof globalPriceRange[0] === 'number' && typeof globalPriceRange[1] === 'number' && globalPriceRange[1] > globalPriceRange[0]) && (
                    <Slider
                      range
                      min={Math.floor(globalPriceRange[0])}
                      max={Math.ceil(globalPriceRange[1])}
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
                  sortByState={pendingSortBy}
                  onSortChange={(e) => setPendingSortBy(e.target.value)}
                  onApply={() => {
                    setPriceRange(mobilePriceRange);
                    setSortBy(pendingSortBy);
                    setCurrentPage(1);
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
              {(typeof globalPriceRange[0] === 'number' && typeof globalPriceRange[1] === 'number' && globalPriceRange[1] > globalPriceRange[0]) && (
                <Slider
                  range
                  min={Math.floor(globalPriceRange[0])}
                  max={Math.ceil(globalPriceRange[1])}
                  step={1}
                  value={desktopPriceRange.map(v => Math.round(v))}
                  onChange={vals => setDesktopPriceRange(vals.map(v => Math.round(v)))}
                  onAfterChange={vals => {
                    setPriceRange([Math.round(vals[0]), Math.round(vals[1])]);
                    setCurrentPage(1);
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
            </div>
            <FiltersContent
              sortByState={sortBy}
              onSortChange={handleSortChange}
              isMobile={false}
            />
          </aside>

          {/* Results */}
          <main className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="text-xl">Loading search results...</div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-xl">{error}</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-xl mb-4">No products found</div>
                <p className="text-blue-200 mb-6">Try adjusting your search terms or filters</p>
                <Link 
                  to="/"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Browse all products
                </Link>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid gap-8 gap-y-12 w-full"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                  {products.map((product) => (
                    <CardItem
                      key={product.id}
                      id={product.id}
                      title={product.name}
                      price={product.price}
                      thumbnail={product.image_url}
                      description={product.description}
                      category={product.category}
                      brand={product.brand}
                      rating={product.rating?.average || 0}
                      ratingCount={product.rating?.count || 0}
                      showDescription={true}
                      showAddToCart={true}
                      imgClass="w-[200px] h-[200px]"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      className="px-3 py-1 rounded bg-blue-900 text-white disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    
                    <span className="text-white font-semibold">Page {currentPage} of {totalPages}</span>
                    
                    <button
                      className="px-3 py-1 rounded bg-blue-900 text-white disabled:opacity-50"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Search; 