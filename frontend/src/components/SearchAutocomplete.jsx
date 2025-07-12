import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = `${import.meta.env.VITE_API_URL}/api/products`;

const SearchAutocomplete = ({ query, onQueryChange, onSubmit, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef();
  const navigate = useNavigate();

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ products: [], categories: [], brands: [] });
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/search/autocomplete?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = suggestions.products.length + suggestions.categories.length + suggestions.brands.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < totalItems - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        handleSuggestionClick(getSelectedSuggestion());
      } else {
        onSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Get the selected suggestion based on index
  const getSelectedSuggestion = () => {
    let currentIndex = 0;
    
    // Check products
    if (selectedIndex < suggestions.products.length) {
      return { type: 'product', item: suggestions.products[selectedIndex] };
    }
    currentIndex += suggestions.products.length;
    
    // Check categories
    if (selectedIndex < currentIndex + suggestions.categories.length) {
      return { type: 'category', item: suggestions.categories[selectedIndex - currentIndex] };
    }
    currentIndex += suggestions.categories.length;
    
    // Check brands
    if (selectedIndex < currentIndex + suggestions.brands.length) {
      return { type: 'brand', item: suggestions.brands[selectedIndex - currentIndex] };
    }
    
    return null;
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (!suggestion) return;

    setShowSuggestions(false);
    setSelectedIndex(-1);

    switch (suggestion.type) {
      case 'product':
        navigate(`/product/${suggestion.item.id}`);
        break;
      case 'category':
        navigate(`/category/${encodeURIComponent(suggestion.item.name)}`);
        break;
      case 'brand':
        navigate(`/brand/${encodeURIComponent(suggestion.item.name)}`);
        break;
      default:
        break;
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      navigate(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderSuggestionItem = (item, type, index) => {
    const isSelected = index === selectedIndex;
    const baseClasses = "px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3";
    const selectedClasses = isSelected ? "bg-gray-100" : "";
    
    let icon, text, subtext;
    
    switch (type) {
      case 'product':
        icon = (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
        text = item.name;
        subtext = `${item.brand || 'No brand'} • €${item.price}`;
        break;
      case 'category':
        icon = (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
        text = item.name;
        subtext = 'Category';
        break;
      case 'brand':
        icon = (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
        text = item.name;
        subtext = 'Brand';
        break;
      default:
        return null;
    }

    return (
      <div
        key={`${type}-${item.id}`}
        className={`${baseClasses} ${selectedClasses}`}
        onClick={() => handleSuggestionClick({ type, item })}
      >
        {icon}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{text}</div>
          <div className="text-xs text-gray-500">{subtext}</div>
        </div>
      </div>
    );
  };

  const allSuggestions = [
    ...suggestions.products.map((item, index) => ({ item, type: 'product', index })),
    ...suggestions.categories.map((item, index) => ({ item, type: 'category', index: index + suggestions.products.length })),
    ...suggestions.brands.map((item, index) => ({ item, type: 'brand', index: index + suggestions.products.length + suggestions.categories.length }))
  ];

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className={className}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-mariner-500 hover:text-mariner-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Loading suggestions...</div>
          ) : allSuggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No suggestions found</div>
          ) : (
            <div>
              {allSuggestions.map(({ item, type, index }) => 
                renderSuggestionItem(item, type, index)
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete; 