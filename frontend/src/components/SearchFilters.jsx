import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SearchFilters = ({ 
  priceRange, 
  onPriceChange, 
  sortBy, 
  onSortChange, 
  totalResults,
  loading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Price Range Slider */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Price Range: €{priceRange[0]} - €{priceRange[1]}
          </label>
          <div className="px-2">
            <Slider
              range
              min={0}
              max={1000}
              value={priceRange}
              onChange={onPriceChange}
              trackStyle={[{ backgroundColor: '#3b82f6' }]}
              handleStyle={[
                { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
                { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }
              ]}
              railStyle={{ backgroundColor: '#e5e7eb' }}
            />
          </div>
        </div>
        
        {/* Sort Options */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
          <select 
            value={sortBy} 
            onChange={onSortChange}
            className="w-full md:w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            disabled={loading}
          >
            <option value="rating_desc">Highest rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="flex-1 flex items-end">
          <div className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${totalResults} results found`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters; 