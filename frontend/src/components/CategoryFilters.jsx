// ISP: Componente separado para filtros con interfaz clara
import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// ISP: Props específicas para cada responsabilidad
const CategoryFilters = ({
  brands,
  selectedBrands,
  sortConfig,
  onBrandChange,
  onSortChange,
  showApplyButton = false,
  onApply
}) => {
  const handleBrandToggle = (brandId, checked) => {
    let newBrands = selectedBrands ? [...selectedBrands] : [];
    const brandIdStr = brandId.toString();
    
    if (checked) {
      if (!newBrands.includes(brandIdStr)) {
        newBrands.push(brandIdStr);
      }
    } else {
      newBrands = newBrands.filter(b => b !== brandIdStr);
    }
    
    onBrandChange(newBrands);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    let newSort;
    
    switch (value) {
      case 'price_asc':
        newSort = { by: 'price', order: 'asc' };
        break;
      case 'price_desc':
        newSort = { by: 'price', order: 'desc' };
        break;
      case 'rating_desc':
      default:
        newSort = { by: 'rating', order: 'desc' };
        break;
    }
    
    onSortChange(newSort);
  };

  const getSortValue = () => {
    if (sortConfig.by === 'price') {
      return sortConfig.order === 'asc' ? 'price_asc' : 'price_desc';
    }
    return 'rating_desc';
  };

  return (
    <div>
      {/* Brands Filter */}
      <div className="mb-3">
        <label className="block text-sm mb-1 text-white">Brands</label>
        <div className="flex flex-col gap-1">
          {brands.map(brand => (
            <label 
              key={brand.id} 
              className="flex items-center gap-2 text-blue-900 bg-white rounded px-2 py-1 cursor-pointer"
            >
              <input
                type="checkbox"
                value={brand.id}
                checked={selectedBrands && selectedBrands.includes(brand.id.toString())}
                onChange={(e) => handleBrandToggle(e.target.value, e.target.checked)}
              />
              {brand.name}
            </label>
          ))}
        </div>
      </div>

      {/* Sort Filter */}
      <div className="mb-3">
        <label className="block text-sm mb-1 text-white">Order by</label>
        <select
          value={getSortValue()}
          onChange={handleSortChange}
          className="w-full border rounded px-2 py-1 text-blue-900 bg-white focus:bg-white focus:border-blue-400"
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating_desc">Rating: High to Low</option>
        </select>
      </div>

      {/* Apply Button for Mobile */}
      {showApplyButton && (
        <button
          className="w-full bg-blue-700 text-white py-2 rounded mt-4 font-semibold"
          onClick={onApply}
        >
          Apply filters
        </button>
      )}
    </div>
  );
};

export default CategoryFilters;
