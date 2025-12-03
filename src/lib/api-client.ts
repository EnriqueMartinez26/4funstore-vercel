const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function adaptProduct(apiProduct: any): any {
  if (!apiProduct || typeof apiProduct !== 'object') return apiProduct;
  if (apiProduct.productoId && !apiProduct.nombre) return adaptProduct(apiProduct.productoId);

  return {
    id: apiProduct._id || apiProduct.id,
    name: apiProduct.nombre,
    description: apiProduct.descripcion,
    price: apiProduct.precio,
    platform: typeof apiProduct.plataformaId === 'object' && apiProduct.plataformaId !== null
      ? { id: apiProduct.plataformaId._id || apiProduct.plataformaId.id, name: apiProduct.plataformaId.nombre } 
      : { id: apiProduct.plataformaId || 'unknown', name: 'Plataforma' },
    genre: typeof apiProduct.generoId === 'object' && apiProduct.generoId !== null
      ? { id: apiProduct.generoId._id || apiProduct.generoId.id, name: apiProduct.generoId.nombre }
      : { id: apiProduct.generoId || 'unknown', name: 'Género' },
    type: apiProduct.tipo === 'Fisico' ? 'Physical' : 'Digital',
    releaseDate: apiProduct.fechaLanzamiento,
    developer: apiProduct.desarrollador,
    // Soporte híbrido de imágenes (Locales y Remotas)
    imageId: apiProduct.imagenUrl || 'https://placehold.co/600x400/png?text=Sin+Imagen',
    rating: apiProduct.calificacion || 0,
    stock: apiProduct.stock || 0
  };
}

export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error API: ${response.statusText}`);
    }
    return response.json();
  }

  // Auth
  static async login(data: any) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  static async register(data: any) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  static async getProfile(token: string) { return this.request('/auth/profile', { headers: { Authorization: `Bearer ${token}` } }); }
  static async logout(token: string) { return this.request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); }

  // Productos
  static async getProducts(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
  
    const queryString = query.toString() ? `?${query.toString()}` : "";
    const data = await this.request(`/products${queryString}`);
  
    if (data.data && Array.isArray(data.data)) {
      return {
        products: data.data.map(adaptProduct),
        meta: data.meta
      };
    }
    
    return {
      products: Array.isArray(data) ? data.map(adaptProduct) : [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  }

  static async getProductById(id: string) {
    const data = await this.request(`/products/${id}`);
    return adaptProduct(data);
  }
  static async createProduct(productData: any, token?: string) {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const backendPayload = {
      nombre: productData.name,
      descripcion: productData.description,
      precio: parseFloat(productData.price),
      plataformaId: productData.platformId,
      generoId: productData.genreId,
      tipo: productData.type === 'Physical' ? 'Fisico' : 'Digital',
      fechaLanzamiento: new Date(),
      desarrollador: productData.developer,
      imagenUrl: productData.imageUrl,
      stock: parseInt(productData.stock),
      activo: true
    };
    return this.request('/products', { method: 'POST', headers, body: JSON.stringify(backendPayload) });
  }
  static async updateProduct(id: string, productData: any, token?: string) {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const backendPayload = { 
        nombre: productData.name, 
        descripcion: productData.description, 
        precio: parseFloat(productData.price),
        stock: parseInt(productData.stock), 
        imagenUrl: productData.imageUrl,
        plataformaId: productData.platformId, 
        generoId: productData.genreId,
        desarrollador: productData.developer,
        tipo: productData.type === 'Physical' ? 'Fisico' : 'Digital'
    };
    return this.request(`/products/${id}`, { method: 'PUT', headers, body: JSON.stringify(backendPayload) });
  }
  static async deleteProduct(id: string, token?: string) {
    return this.request(`/products/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  }
  
  // Categorías
  static async getCategories() { return this.request('/categories'); }

  // Carrito
  static async getCart(userId?: string, token?: string) {
    if (!userId) return { cart: { items: [] } };
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const data = await this.request(`/cart/${userId}`, { headers });
    if (data.cart?.items) {
       data.cart.items = data.cart.items.map((item: any) => ({
         ...item,
         id: item._id,
         productId: item.product?._id,
         name: item.product?.nombre || item.name,
         price: item.product?.precio || item.price,
         image: item.product?.imagenUrl || item.image
       }));
    }
    return data;
  }
  static async addToCart(userId: string, productId: string, quantity: number, token?: string) {
    return this.request('/cart', { 
      method: 'POST', 
      headers: { Authorization: `Bearer ${token}` }, 
      body: JSON.stringify({ userId, productId, quantity }) 
    });
  }
  static async removeFromCart(userId: string, itemId: string, token?: string) {
    return this.request(`/cart/${userId}/${itemId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  }
  static async updateCartItem(userId: string, itemId: string, quantity: number, token?: string) {
    return this.request('/cart', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId, itemId, quantity }) });
  }
  static async clearCart(userId: string, token?: string) {
    return this.request(`/cart/${userId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  }

  // Wishlist & Orders
  static async getWishlist(userId: string, token?: string) {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const data = await this.request(`/wishlist/${userId}`, { headers });
    return Array.isArray(data.wishlist) ? data.wishlist.map(adaptProduct) : [];
  }
  static async toggleWishlist(userId: string, productId: string, token?: string) {
    return this.request('/wishlist/toggle', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ userId, productId }) });
  }
  static async createOrder(orderData: any, token?: string) {
    return this.request('/orders', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(orderData) });
  }
}