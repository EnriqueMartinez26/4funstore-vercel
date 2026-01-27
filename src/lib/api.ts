import { ProductSchema, type Product } from './schemas';
import type { PaginatedResponse } from './types';
import { z } from 'zod';
import { Logger } from './logger';

const getBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
  }
  // Client-side: Path relativo para aprovechar los rewrites de Next.js (proxy al backend)
  return '';
};

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const baseUrl = getBaseUrl();
    const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
    const url = `${baseUrl}${apiPath}${endpoint}`;

    // Fallback: Token en localStorage cuando el proxy de Next.js no propaga cookies HttpOnly
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers as any
    };

    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      credentials: 'include', // Equivalente a withCredentials: true en Axios. CRUCIAL para envíar cookies.
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Normalizamos el mensaje de error (viene en mil formatos distintos)
      const errorMessage = data.message || data.error || (Array.isArray(data.errors) ? data.errors.map((e: any) => e.msg || e.message).join(', ') : JSON.stringify(data.errors)) || `Error API: ${response.statusText}`;

      if (response.status === 401) {
        Logger.debug(`[API Auth] 401 Unauthorized:`, errorMessage);
      } else {
        Logger.error(`[API Error] ${endpoint} (${response.status}):`, errorMessage);
      }
      throw new ApiError(errorMessage, response.status, data);
    }
    return data;
  }


  static async login(data: { email: string; password: string }) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  static async register(data: { name: string; email: string; password: string }) { return this.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }

  static async getProfile() {
    try {
      return await this.request('/auth/profile');
    } catch (error: any) {
      // Si no estamos autenticados (401), retornamos success: false limpiamente
      if (error.status === 401 || error?.response?.status === 401 || (error instanceof ApiError && error.status === 401)) {
        return { success: false, user: null };
      }
      throw error;
    }
  }
  static async logout() { return this.request('/auth/logout', { method: 'POST' }); }


  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "4fun_preset");

    const res = await fetch(`https://api.cloudinary.com/v1_1/dxlbwdqop/image/upload`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Error Cloudinary");
    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Failed to get secure url from Cloudinary");
    }

    return data.secure_url;
  }


  static async sendContactMessage(data: { firstName: string, lastName: string, email: string, message: string }) {
    return this.request('/contact', { method: 'POST', body: JSON.stringify(data) });
  }


  static async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    platform?: string;
    genre?: string;
    sort?: string;
  }, options?: RequestInit): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.platform && params.platform !== 'all') query.append("platform", params.platform);
    if (params?.genre && params.genre !== 'all') query.append("genre", params.genre);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await this.request(`/products${queryString}`, options);

    const emptyMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };

    // Chequeamos si es array plano o paginado
    let rawProducts = [];
    let meta = emptyMeta;

    if (Array.isArray(response)) {
      rawProducts = response;
    } else if (response.data && Array.isArray(response.data)) {
      rawProducts = response.data;
      // Mapeamos keys del backend a nuestra interface Meta
      meta = {
        total: response.pagination?.total || response.meta?.total || 0,
        page: response.pagination?.page || response.meta?.page || 1,
        limit: response.pagination?.limit || response.meta?.limit || 10,
        totalPages: response.pagination?.pages || response.meta?.totalPages || 1
      };
    } else if (response.products && Array.isArray(response.products)) {
      // Caso donde el backend ya machea nuestra interface
      rawProducts = response.products;
      meta = response.meta || emptyMeta;
    }

    const parsedProducts = rawProducts.map((item: any) => {
      try { return ProductSchema.parse(item); } catch (e) {
        Logger.error("Product parse error:", e);
        return null;
      }
    }).filter(Boolean) as Product[];

    return {
      products: parsedProducts,
      meta
    };
  }

  static async getProductById(id: string) {
    const response = await this.request(`/products/${id}`);
    return ProductSchema.parse(response.data || response);
  }

  static async createProduct(productData: any) {
    const backendPayload = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      platform: productData.platformId,
      genre: productData.genreId,
      type: productData.type,
      releaseDate: new Date(),
      developer: productData.developer,
      imageId: productData.imageUrl,
      trailerUrl: productData.trailerUrl, // Nuevo campo
      stock: parseInt(productData.stock),
      active: true
    };
    return this.request('/products', { method: 'POST', body: JSON.stringify(backendPayload) });
  }

  static async updateProduct(id: string, productData: any) {
    // Shotgun approach: Mandamos todo formateado por si las dudas
    const backendPayload = {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      stock: parseInt(String(productData.stock), 10), // Forzar entero
      imageId: productData.imageUrl,
      trailerUrl: productData.trailerUrl, // Nuevo campo
      // IDs duplicados para asegurar compatibilidad
      platform: productData.platformId,
      platformId: productData.platformId,
      genre: productData.genreId,
      genreId: productData.genreId,
      developer: productData.developer,
      type: productData.type
    };
    return this.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(backendPayload) });
  }

  static async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  static async deleteProductsBulk(ids: string[]) {
    return this.request('/products/multi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
  }


  static async getCategories() {
    const res = await this.request('/categories');
    return res.data || res;
  }
  static async getCategoryById(id: string) { return this.request(`/categories/${id}`); }
  static async createCategory(data: any) {
    return this.request('/categories', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }
  static async deleteCategoriesBulk(ids: string[]) {
    return this.request('/categories/multi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
  }


  static async getPlatforms() {
    const res = await this.request('/platforms');
    return res.data || res;
  }
  static async getPlatformById(id: string) { return this.request(`/platforms/${id}`); }
  static async createPlatform(data: any) {
    return this.request('/platforms', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updatePlatform(id: string, data: any) {
    return this.request(`/platforms/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deletePlatform(id: string) {
    return this.request(`/platforms/${id}`, { method: 'DELETE' });
  }
  static async deletePlatformsBulk(ids: string[]) {
    return this.request(`/platforms/multi`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
  }

  static async getGenres() {
    const res = await this.request('/genres');
    return res.data || res;
  }
  static async getGenreById(id: string) { return this.request(`/genres/${id}`); }
  static async createGenre(data: any) {
    return this.request('/genres', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateGenre(id: string, data: any) {
    return this.request(`/genres/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }
  static async deleteGenre(id: string) {
    return this.request(`/genres/${id}`, { method: 'DELETE' });
  }
  static async deleteGenresBulk(ids: string[]) {
    return this.request(`/genres/multi`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
  }


  static async getCart(userId?: string) {
    if (!userId) return { cart: { items: [] } };
    const data = await this.request(`/cart/${userId}`);
    if (data.cart?.items) {
      data.cart.items = data.cart.items.map((item: any) => {
        let parsedProduct = null;
        if (item.product) {
          try {
            parsedProduct = ProductSchema.parse(item.product);
          } catch (e) {
            Logger.error(`[ApiClient] Explotó el parseo del producto en cart item ${item._id}:`, e);
          }
        }
        return {
          ...item, id: item._id, productId: item.product?._id,
          name: parsedProduct?.name || item.name || "Unknown Product",
          price: parsedProduct?.price ?? item.price ?? 0,
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


  static async getUserOrders(userId: string) {
    return this.request(`/orders/user/${userId}`);
  }


  // --- KEY MANAGEMENT (ADMIN) ---
  static async addKeys(productId: string, keys: string[]) {
    return this.request('/keys/bulk', {
      method: 'POST',
      body: JSON.stringify({ productId, keys })
    });
  }

  static async deleteKey(keyId: string) {
    return this.request(`/keys/${keyId}`, { method: 'DELETE' });
  }

  static async getKeysByProduct(productId: string) {
    return this.request(`/keys/product/${productId}`);
  }
}
