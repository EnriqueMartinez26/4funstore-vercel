import { ProductSchema } from './schemas';
import { z } from 'zod';

// Configuración dinámica de la URL base
const getBaseUrl = () => {
  // Si estamos en el servidor (SSR), usamos la variable de entorno o localhost por defecto
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  
  // Si estamos en el cliente, construimos la URL basada en el hostname actual
  // Esto permite que funcione tanto en localhost como en 192.168.x.x sin cambiar .env
  const hostname = window.location.hostname;
  const port = '5000'; // Asegúrate de que este sea el puerto correcto de tu backend (5000 o 9003)
  
  // Si tienes una variable de entorno definida, la respetamos, 
  // pero intentamos reemplazar 'localhost' por la IP si estamos navegando por IP
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
     if (envUrl.includes('localhost') && hostname !== 'localhost') {
         return envUrl.replace('localhost', hostname);
     }
     return envUrl;
  }

  return `http://${hostname}:${port}`;
};

export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const baseUrl = getBaseUrl();
    // Normalizamos para asegurar que /api no se duplique si ya viene en la base
    const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
    const url = `${baseUrl}${apiPath}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      credentials: 'include', // CRÍTICO: Esto envía la cookie HttpOnly
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Error API: ${response.statusText}`);
    }
    return data;
  }

  // Auth
  static async login(data: any) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  static async register(data: any) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  static async getProfile() { return this.request('/auth/profile'); }
  static async logout() { return this.request('/auth/logout', { method: 'POST' }); }

  // Productos con Validación Zod
  static async getProducts(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
  
    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await this.request(`/products${queryString}`);
  
    if (response.data && Array.isArray(response.data)) {
      const parsedProducts = response.data.map((item: any) => {
        try {
          return ProductSchema.parse(item);
        } catch (e) {
          console.error("Error parseando producto:", item, e);
          return null;
        }
      }).filter(Boolean);

      return { products: parsedProducts, meta: response.meta };
    }
    
    return { products: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }

  static async getProductById(id: string) {
    const response = await this.request(`/products/${id}`);
    return ProductSchema.parse(response.data);
  }
  
  static async createProduct(productData: any) {
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
    return this.request('/products', { method: 'POST', body: JSON.stringify(backendPayload) });
  }

  static async updateProduct(id: string, productData: any) {
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
    return this.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(backendPayload) });
  }

  static async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }
  
  static async getCategories() { return this.request('/categories'); }

  // Carrito y Wishlist
  static async getCart(userId?: string) {
    if (!userId) return { cart: { items: [] } };
    const data = await this.request(`/cart/${userId}`);
    
    if (data.cart?.items) {
       data.cart.items = data.cart.items.map((item: any) => {
         let parsedProduct = null;
         if (item.product) {
            try { parsedProduct = ProductSchema.parse(item.product); } catch(e) {}
         }
         return {
           ...item,
           id: item._id,
           productId: item.product?._id,
           name: parsedProduct?.name || item.name,
           price: parsedProduct?.price || item.price,
           image: parsedProduct?.imageId || item.image
         };
       });
    }
    return data;
  }

  static async addToCart(userId: string, productId: string, quantity: number) {
    return this.request('/cart', { method: 'POST', body: JSON.stringify({ userId, productId, quantity }) });
  }

  static async removeFromCart(userId: string, itemId: string) {
    return this.request(`/cart/${userId}/${itemId}`, { method: 'DELETE' });
  }

  static async updateCartItem(userId: string, itemId: string, quantity: number) {
    return this.request('/cart', { method: 'PUT', body: JSON.stringify({ userId, itemId, quantity }) });
  }

  static async clearCart(userId: string) {
    return this.request(`/cart/${userId}`, { method: 'DELETE' });
  }

  static async getWishlist(userId: string) {
    const response = await this.request(`/wishlist/${userId}`);
    if (Array.isArray(response.wishlist)) {
        return response.wishlist.map((item: any) => {
            try { return ProductSchema.parse(item); } catch { return null; }
        }).filter(Boolean);
    }
    return [];
  }

  static async toggleWishlist(userId: string, productId: string) {
    return this.request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ userId, productId }) });
  }

  static async createOrder(orderData: any) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
  }
}
