// DIP: Abstracción para operaciones de productos
export class ProductRepository {
  constructor(apiClient) {
    this.apiClient = apiClient; // Dependency injection
  }

  async getCategories() {
    return await this.apiClient.get('/api/products/categories');
  }

  async getByCategory(categoryId) {
    return await this.apiClient.get('/api/products', { category_id: categoryId });
  }

  async getFiltered(params) {
    return await this.apiClient.get('/api/products', params);
  }

  async getTopRated(limit = 8) {
    return await this.apiClient.get('/api/products', {
      sort_by: 'rating',
      sort_order: 'desc',
      per_page: limit
    });
  }
}
