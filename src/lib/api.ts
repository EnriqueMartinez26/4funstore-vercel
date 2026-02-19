import { ProductSchema, type Product } from './schemas';
import type { PaginatedResponse } from './types';
import { z } from 'zod';
import { Logger } from './logger';

const getBaseUrl = () => {
  // Eliminamos el typeof window para que SIEMPRE apunte directo al backend,
  // saltándonos el proxy de Vercel que causa el Timeout.
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
};

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private static async request(endpoint: string, options: RequestInit = {}) {
    let baseUrl = getBaseUrl();

    // Limpieza de seguridad por si la URL tiene una barra al final en Vercel
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const apiPath = baseUrl.endsWith('/api') ? '' : '/api';
    const url = `${baseUrl}${apiPath}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      'ngrok-skip-browser-warning': 'true',
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
      // Normalizamos el mensaje de error para evitar que sea un Objeto y rompa React
      let errorMessage = data.message || data.error;

      if (Array.isArray(data.errors)) {
        errorMessage = data.errors.map((e: any) => e.msg || e.message).join(', ');
      } else if (typeof errorMessage === 'object') {
        errorMessage = errorMessage.message || JSON.stringify(errorMessage);
      }

      errorMessage = errorMessage || `Error API: ${response.statusText}`;

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
  static async verifyEmail(token: string) { return this.request(`/auth/verify?token=${token}`); }

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
    discounted?: boolean;
  }, options?: RequestInit): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.platform && params.platform !== 'all') query.append("platform", params.platform);
    if (params?.genre && params.genre !== 'all') query.append("genre", params.genre);
    if (params?.sort) query.append("sort", params.sort);
    if (params?.discounted) query.append("discounted", "true");

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
      trailerUrl: productData.trailerUrl,
      stock: parseInt(productData.stock),
      active: true,
      specPreset: productData.specPreset,
      discountPercentage: Number(productData.discountPercentage) || 0,
      discountEndDate: productData.discountEndDate || null,
    };
    return this.request('/products', { method: 'POST', body: JSON.stringify(backendPayload) });
  }

  static async updateProduct(id: string, productData: any) {
    const backendPayload = {
      name: productData.name,
      description: productData.description,
      price: Number(productData.price),
      stock: parseInt(String(productData.stock), 10),
      imageId: productData.imageUrl,
      trailerUrl: productData.trailerUrl,
      platform: productData.platformId,
      genre: productData.genreId,
      developer: productData.developer,
      type: productData.type,
      specPreset: productData.specPreset,
      discountPercentage: Number(productData.discountPercentage) || 0,
      discountEndDate: productData.discountEndDate || null,
    };
    return this.request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(backendPayload) });
  }

  static async reorderProduct(id: string, newPosition: number) {
    return this.request(`/products/${id}/reorder`, { method: 'PUT', body: JSON.stringify({ newPosition }) });
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


  static async getCart() {
    const data = await this.request('/cart');
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

  static async addToCart(productId: string, quantity: number) {
    return this.request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
  }

  static async removeFromCart(itemId: string) {
    return this.request(`/cart/${itemId}`, { method: 'DELETE' });
  }

  static async updateCartItem(itemId: string, quantity: number) {
    return this.request('/cart', { method: 'PUT', body: JSON.stringify({ itemId, quantity }) });
  }

  static async clearCart() {
    return this.request('/cart', { method: 'DELETE' });
  }


  static async getWishlist() {
    const response = await this.request('/wishlist');
    if (Array.isArray(response.wishlist)) {
      return response.wishlist.map((item: any) => {
        try { return ProductSchema.parse(item); } catch { return null; }
      }).filter(Boolean);
    }
    return [];
  }

  static async toggleWishlist(productId: string) {
    return this.request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) });
  }


  static async createOrder(orderData: any) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
  }


  static async getUserOrders() {
    return this.request('/orders/user');
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

  // --- DASHBOARD (ADMIN) ---
  static async getDashboardStats() {
    const res = await this.request('/dashboard/stats');
    return res.data;
  }

  static async getSalesChart() {
    const res = await this.request('/dashboard/chart');
    return res.data;
  }

  static async getTopProducts() {
    const res = await this.request('/dashboard/top-products');
    return res.data;
  }

  // --- USER MANAGEMENT (ADMIN) ---
  static async getUsers(params: { page?: number; limit?: number; search?: string; role?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.role && params.role !== 'all') query.append("role", params.role);

    return this.request(`/users?${query.toString()}`);
  }

  static async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  static async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  static async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }
}
