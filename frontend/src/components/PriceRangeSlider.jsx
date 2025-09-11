// SRP: Componente dedicado solo al slider de precios
import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const PriceRangeSlider = ({
  minPrice,
  maxPrice,
  currentRange,
  onChange,
  onAfterChange,
  disabled = false
}) => {
  const isValidRange = (
    typeof minPrice === 'number' &&
    typeof maxPrice === 'number' &&
    maxPrice > minPrice
  );

  if (!isValidRange || disabled) {
    return (
      <div className="mb-4">
        <label className="block text-sm mb-2 text-white">Price range</label>
        <div className="text-sm text-gray-400">Price range not available</div>
      </div>
    );
  }

  const safeCurrentRange = currentRange.map(v => Math.round(v));

  return (
    <div className="mb-4">
      <label className="block text-sm mb-2 text-white">Price range</label>
      <Slider
        range
        min={Math.floor(minPrice)}
        max={Math.ceil(maxPrice)}
        step={1}
        value={safeCurrentRange}
        onChange={vals => onChange && onChange(vals.map(v => Math.round(v)))}
        onChangeComplete={vals => onAfterChange && onAfterChange(vals.map(v => Math.round(v)))}
        allowCross={false}
        trackStyle={[{ backgroundColor: '#60a5fa' }]}
        handleStyle={[
          { borderColor: '#60a5fa', backgroundColor: '#fff' },
          { borderColor: '#60a5fa', backgroundColor: '#fff' }
        ]}
        railStyle={{ backgroundColor: '#1e293b' }}
      />
      <div className="flex justify-between w-full max-w-md mt-2">
        <span className="text-xs text-white">€{safeCurrentRange[0]}</span>
        <span className="text-xs text-white">€{safeCurrentRange[1]}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
