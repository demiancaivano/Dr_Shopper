// Versión refactorizada aplicando principios SOLID
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { useCategoryData } from '../hooks/useCategoryData';
import { useCategoryFilters } from '../hooks/useCategoryFilters';
import CategoryFilters from '../components/CategoryFilters';
import PriceRangeSlider from '../components/PriceRangeSlider';
import CardItem from '../components/CardItem';
import RelatedProductCard from '../components/RelatedProductCard';
import MobileCarousel from '../components/MobileCarousel';

// SRP: Componente principal enfocado solo en coordinación y renderizado
const CategoryRefactored = () => {
  const { categoryName } = useParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [desktopPriceRange, setDesktopPriceRange] = useState([0, 1000]);
  const [mobilePriceRange, setMobilePriceRange] = useState([0, 1000]);

  // Cambiar el título de la página
  usePageTitle(`Category: ${categoryName}`);

  // SRP: Hooks especializados para diferentes responsabilidades
  const {
    filters,
    pendingFilters,
    sort,
    pendingSort,
    page,
    resetFilters,
    updatePriceRange,
    updateBrands,
    updateSort,
    updatePendingBrands,
    updatePendingSort,
    applyPendingFilters,
    goToPage
  } = useCategoryFilters();

  const {
    products,
    brands,
    allBrands,
    loading,
    error,
    totalPages,
    allPrices,
    relatedProducts
  } = useCategoryData(categoryName, filters, sort, page);

  // Reset filters when category changes
  useEffect(() => {
    resetFilters();
  }, [categoryName, resetFilters]);

  // Sync price ranges with category data
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

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Event handlers - SRP: Cada handler tiene una responsabilidad específica
  const handleDesktopPriceChange = (range) => {
    setDesktopPriceRange(range);
  };

  const handleDesktopPriceAfterChange = (range) => {
    updatePriceRange(range[0], range[1]);
  };

  const handleMobilePriceChange = (range) => {
    setMobilePriceRange(range);
  };

  const handleBrandChange = (brands) => {
    updateBrands(brands);
  };

  const handlePendingBrandChange = (brands) => {
    updatePendingBrands(brands);
  };

  const handleSortChange = (sortConfig) => {
    updateSort(sortConfig);
  };

  const handlePendingSortChange = (sortConfig) => {
    updatePendingSort(sortConfig);
  };

  const handleMobileFiltersApply = () => {
    updatePriceRange(mobilePriceRange[0], mobilePriceRange[1]);
    applyPendingFilters();
    setShowMobileFilters(false);
  };

  const handlePageChange = (newPage) => {
    goToPage(newPage, totalPages);
  };

  // SRP: Función dedicada al renderizado de productos
  const renderProducts = () => {
    if (loading) {
      return <div className="text-center py-10">Loading products...</div>;
    }

    if (error) {
      return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    if (products.length === 0) {
      return <div className="text-center py-10">No products found for this category.</div>;
    }

    if (products.length === 1) {
      return (
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
              imgClass=""
            />
          </div>
        </div>
      );
    }

    return (
      <>
        <div 
          className="grid gap-4 sm:gap-6 md:gap-8 gap-y-6 sm:gap-y-8 md:gap-y-12 w-full"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
        >
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
              imgClass=""
            />
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            className="px-3 py-1 rounded bg-blue-900 text-white disabled:opacity-50"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="text-white font-semibold">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-blue-900 text-white disabled:opacity-50"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </>
    );
  };

  // SRP: Función dedicada al renderizado de productos relacionados
  const renderRelatedProducts = () => {
    if (relatedProducts.length === 0) return null;

    return (
      <div className="container mx-auto px-4 mt-12">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Related products</h2>
        
        {/* Desktop: row of 4 */}
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
        
        {/* Mobile: carousel */}
        <div className="block md:hidden">
          <MobileCarousel 
            products={relatedProducts.map(prod => ({
              ...prod,
              price: Number(prod.price).toFixed(2),
              final_price: Number(prod.final_price).toFixed(2),
            }))} 
            category="Related" 
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 flex flex-col gap-6 mt-6">
      <h1 className="font-bold text-3xl text-center text-white">{categoryName}</h1>
      
      {/* Mobile filters button */}
      <div className="block lg:hidden mb-4">
        <button
          className="w-full bg-blue-900 text-white py-2 rounded font-semibold"
          onClick={() => {
            setShowMobileFilters(true);
          }}
        >
          Show filters
        </button>
        
        {/* Mobile filters modal */}
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
              
              <PriceRangeSlider
                minPrice={allPrices.min}
                maxPrice={allPrices.max}
                currentRange={mobilePriceRange}
                onChange={handleMobilePriceChange}
              />
              
              <CategoryFilters
                brands={allBrands}
                selectedBrands={pendingFilters.brands}
                sortConfig={pendingSort}
                onBrandChange={handlePendingBrandChange}
                onSortChange={handlePendingSortChange}
                showApplyButton={true}
                onApply={handleMobileFiltersApply}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        {/* Desktop sidebar */}
        <aside 
          className="hidden lg:block w-full lg:w-1/4 bg-blue-900 rounded-lg shadow p-4 mb-4 lg:mb-0 text-white" 
          style={{ alignSelf: "flex-start" }}
        >
          <h2 className="text-lg font-semibold mb-4 text-white">Filters</h2>
          
          <PriceRangeSlider
            minPrice={allPrices.min}
            maxPrice={allPrices.max}
            currentRange={desktopPriceRange}
            onChange={handleDesktopPriceChange}
            onAfterChange={handleDesktopPriceAfterChange}
          />
          
          <CategoryFilters
            brands={allBrands}
            selectedBrands={filters.brands}
            sortConfig={sort}
            onBrandChange={handleBrandChange}
            onSortChange={handleSortChange}
            showApplyButton={false}
          />
        </aside>

        {/* Products section */}
        <main className="flex-1">
          {renderProducts()}
        </main>
      </div>
      
      {/* Related products */}
      {renderRelatedProducts()}
    </div>
  );
};

export default CategoryRefactored;
