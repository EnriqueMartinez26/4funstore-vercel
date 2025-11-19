// Apuntamos al puerto 9003 como indicaste en tus .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';

// --- ADAPTADOR DE IDIOMA (Backend Español -> Frontend Inglés) ---
function adaptProduct(apiProduct: any): any {
  if (!apiProduct || typeof apiProduct !== 'object') return apiProduct;

  // Si viene anidado (ej. wishlist)
  if (apiProduct.productoId && !apiProduct.nombre) {
    return adaptProduct(apiProduct.productoId);
  }

  return {
    id: apiProduct._id || apiProduct.id,
    name: apiProduct.nombre,              // Español -> Inglés
    description: apiProduct.descripcion,
    price: apiProduct.precio,
    
    platform: typeof apiProduct.plataformaId === 'object' && apiProduct.plataformaId !== null
      ? { id: apiProduct.plataformaId._id || apiProduct.plataformaId.id, name: apiProduct.plataformaId.nombre } 
      : { id: apiProduct.plataformaId, name: 'Plataforma' },
      
    genre: typeof apiProduct.generoId === 'object' && apiProduct.generoId !== null
      ? { id: apiProduct.generoId._id || apiProduct.generoId.id, name: apiProduct.generoId.nombre }
      : { id: apiProduct.generoId, name: 'Género' },

    type: apiProduct.tipo === 'Fisico' ? 'Physical' : 'Digital',
    releaseDate: apiProduct.fechaLanzamiento,
    developer: apiProduct.desarrollador,
    imageId: apiProduct.imagenUrl,
    rating: apiProduct.calificacion || 0,
    stock: apiProduct.stock || 0
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
      throw new Error(errorData.message || `Error API: ${response.statusText}`);
    }

    return response.json();
  }

  // --- AUTENTICACIÓN ---
  static async login(data: { email: string; password: string }) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }

  static async register(data: { name: string; email: string; password: string }) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }

  static async getProfile(token: string) {
    return this.request('/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
  }

  static async logout(token: string) {
    return this.request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  }

  // --- PRODUCTOS ---
  static async getProducts() {
    const data = await this.request('/products');
    return Array.isArray(data) ? data.map(adaptProduct) : [];
  }

  static async getProductById(id: string) {
    const data = await this.request(`/products/${id}`);
    return adaptProduct(data);
  }

  // --- GESTIÓN: Crear Producto ---
  static async createProduct(productData: any, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    // Convertir a formato Backend (Español)
    const backendPayload = {
      nombre: productData.name,
      descripcion: productData.description,
      precio: parseFloat(productData.price),
      plataformaId: productData.platformId,
      generoId: productData.genreId,
      tipo: productData.type === 'Physical' ? 'Fisico' : 'Digital',
      fechaLanzamiento: productData.releaseDate || new Date(),
      desarrollador: productData.developer,
      imagenUrl: productData.imageUrl,
      stock: parseInt(productData.stock),
      activo: true
    };

    return this.request('/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload),
    });
  }

  static async getCategories() {
    return this.request('/categories');
  }

  // --- CARRITO ---
  static async getCart(userId: string | undefined, token?: string) {
    if (!userId) return { cart: { items: [] } };
    
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const data = await this.request(`/cart/${userId}`, { headers });
    
    if (data.cart && data.cart.items) {
       data.cart.items = data.cart.items.map((item: any) => ({
         ...item,
         name: item.product?.nombre || item.name,
         price: item.product?.precio || item.price,
         image: item.product?.imagenUrl || item.image
       }));
    }
    return data;
  }

  static async addToCart(productId: string, quantity: number, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/cart', {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity }),
    });
  }

  static async removeFromCart(itemId: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request(`/cart/${itemId}`, { method: 'DELETE', headers });
  }

  static async clearCart(token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/cart', { method: 'DELETE', headers });
  }
  
  static async updateCartItem(productId: string, quantity: number, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/cart', { method: 'PUT', headers, body: JSON.stringify({ productId, quantity }) });
  }

  // --- WISHLIST ---
  static async getWishlist(userId: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const data = await this.request(`/wishlist/${userId}`, { headers });
    return Array.isArray(data.wishlist) ? data.wishlist.map(adaptProduct) : [];
  }

  static async toggleWishlist(userId: string, productId: string, token?: string) {
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return this.request('/wishlist/toggle', {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, productId })
    });
  }
}