// SRP: Hook dedicado solo al manejo de datos de categoría
import { useState, useEffect, useRef } from 'react';
import { CategoryService } from '../services/CategoryService';

export const useCategoryData = (categoryName, filters, sort, page) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [allPrices, setAllPrices] = useState({ min: 0, max: 1000 });
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Use refs to avoid infinite loops when comparing objects
  const filtersRef = useRef();
  const sortRef = useRef();
  
  // Only update refs when values actually change
  const filtersStr = JSON.stringify(filters);
  const sortStr = JSON.stringify(sort);
  const filtersChanged = filtersStr !== JSON.stringify(filtersRef.current);
  const sortChanged = sortStr !== JSON.stringify(sortRef.current);
  
  if (filtersChanged) {
    filtersRef.current = filters;
  }
  if (sortChanged) {
    sortRef.current = sort;
  }

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const categoryData = await CategoryService.getCategoryByName(categoryName);
        if (!categoryData) {
          setError('Category not found');
          return;
        }

        // Get price range and brands for category (only on category change)
        if (!filtersRef.current || categoryName !== filtersRef.current.categoryName) {
          const categoryProducts = await CategoryService.getProductsByCategory(categoryData.id);
          const priceRange = CategoryService.calculatePriceRange(categoryProducts);
          const uniqueBrands = CategoryService.extractUniqueBrands(categoryProducts);
          
          setAllPrices(priceRange);
          setAllBrands(uniqueBrands);
          
          // Store category name to avoid re-fetching
          if (filtersRef.current) {
            filtersRef.current.categoryName = categoryName;
          }
        }

        // Get filtered products
        const result = await CategoryService.getFilteredProducts(
          categoryData.id, 
          filters, 
          sort, 
          page
        );
        
        setProducts(result.products || []);
        setTotalPages(result.pages || 1);
        setBrands(CategoryService.extractUniqueBrands(result.products || []));

        // Get related products (only on category change)
        if (!filtersRef.current || categoryName !== filtersRef.current.relatedCategory) {
          const related = await CategoryService.getRelatedProducts(categoryData.id);
          setRelatedProducts(related);
          
          if (filtersRef.current) {
            filtersRef.current.relatedCategory = categoryName;
          }
        }
        
      } catch (err) {
        setError('Error loading category data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryName, filtersStr, sortStr, page]);

  return {
    products,
    brands,
    allBrands,
    loading,
    error,
    totalPages,
    allPrices,
    relatedProducts
  };
};
