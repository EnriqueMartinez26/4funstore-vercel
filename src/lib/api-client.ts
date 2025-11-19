const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function adaptProduct(apiProduct: any): any {
  return {
    id: apiProduct._id || apiProduct.id,
    name: apiProduct.nombre,
    description: apiProduct.descripcion,
    price: apiProduct.precio,
    platform: typeof apiProduct.plataformaId === 'object' 
      ? { id: apiProduct.plataformaId.id, name: apiProduct.plataformaId.nombre } 
      : { id: apiProduct.plataformaId, name: apiProduct.plataformaId },
    genre: typeof apiProduct.generoId === 'object'
      ? { id: apiProduct.generoId.id, name: apiProduct.generoId.nombre }
      : { id: apiProduct.generoId, name: apiProduct.generoId },
    type: apiProduct.tipo === 'Fisico' ? 'Physical' : 'Digital',
    releaseDate: apiProduct.fechaLanzamiento,
    developer: apiProduct.desarrollador,
    imageId: apiProduct.imagenUrl,
    rating: apiProduct.calificacion,
    stock: apiProduct.stock
  };
}

export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async getProducts() {
    const data = await this.request('/products');
    return Array.isArray(data) ? data.map(adaptProduct) : [];
  }

  static async getProductById(id: string) {
    const data = await this.request(`/products/${id}`);
    return adaptProduct(data);
  }

  static async getCategories() {
    return this.request('/categories');
  }

  static async getCart(token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const data = await this.request('/cart', { headers });
    
    if (data.cart && data.cart.items) {
       data.cart.items = data.cart.items.map((item: any) => ({
         ...item,
         name: item.product?.nombre || item.name,
         price: item.product?.precio || item.price
       }));
    }
    return data;
  }

  static async addToCart(productId: string, quantity: number = 1, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity }),
    });
  }

  static async updateCartItem(productId: string, quantity: number, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/cart', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ productId, quantity }),
    });
  }

  static async removeFromCart(productId: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request(`/cart/${productId}`, {
      method: 'DELETE',
      headers,
    });
  }

  static async clearCart(token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/cart', {
      method: 'DELETE',
      headers,
    });
  }
}
