// SRP + DIP: Servicio dedicado solo a operaciones de categoría
import { ProductRepository } from '../repositories/ProductRepository';
import { ApiClient } from './ApiClient';

export class CategoryService {
  static productRepository = new ProductRepository(
    new ApiClient(import.meta.env.VITE_API_URL)
  );

  // OCP: Método extensible para obtener categorías
  static async getCategoryByName(categoryName) {
    try {
      const categories = await this.productRepository.getCategories();
      return categories.find(cat => 
        cat.name.toLowerCase() === categoryName.toLowerCase()
      );
    } catch (error) {
      throw new Error(`Error fetching category: ${error.message}`);
    }
  }

  // SRP: Método específico para productos por categoría
  static async getProductsByCategory(categoryId) {
    try {
      const result = await this.productRepository.getByCategory(categoryId);
      return result.products || [];
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // SRP: Lógica de negocio separada para filtros
  static async getFilteredProducts(categoryId, filters, sort, page) {
    const params = {
      category_id: categoryId,
      per_page: 6,
      page,
      sort_by: sort.by,
      sort_order: sort.order
    };

    // OCP: Fácil agregar nuevos filtros
    if (filters.min !== '' && filters.min !== undefined && filters.min !== null) {
      params.min_price = filters.min;
    }
    if (filters.max !== '' && filters.max !== undefined && filters.max !== null) {
      params.max_price = filters.max;
    }
    if (filters.brands && filters.brands.length > 0) {
      params.brand_ids = filters.brands;
    }

    return await this.productRepository.getFiltered(params);
  }

  // SRP: Cálculo de rango de precios separado
  static calculatePriceRange(products) {
    const prices = products
      .map(p => Number(p.price))
      .filter(p => !isNaN(p));
    
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 1000
    };
  }

  // SRP: Extracción de marcas separada
  static extractUniqueBrands(products) {
    const brands = products
      .filter(p => p.brand_id && p.brand)
      .map(p => ({ id: p.brand_id, name: p.brand }));
    
    // Remove duplicates based on id
    return brands.filter((brand, index, self) => 
      self.findIndex(b => b.id === brand.id) === index
    );
  }

  // SRP: Productos relacionados separado
  static async getRelatedProducts(excludeCategoryId) {
    try {
      const result = await this.productRepository.getTopRated(8);
      const otherProducts = result.products.filter(
        p => p.category_id !== excludeCategoryId
      );
      
      // Shuffle and take 4
      return otherProducts
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    } catch (error) {
      console.error('Error fetching related products:', error);
      return [];
    }
  }
}
