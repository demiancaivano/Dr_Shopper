// DIP: Abstracción para calls de API
export class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Handle array parameters (like brand_ids)
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For brand filtering, append each brand_id separately
        value.forEach(item => url.searchParams.append('brand_id', item));
      } else if (value !== undefined && value !== '' && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // OCP: Fácil agregar más métodos HTTP
  async put(endpoint, data) {
    // Implementation...
  }

  async delete(endpoint) {
    // Implementation...
  }
}
