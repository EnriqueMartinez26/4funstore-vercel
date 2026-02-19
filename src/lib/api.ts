import { ProductSchema, type Product, LoginSchema, RegisterSchema, type LoginValues, type RegisterValues, type RegisterPayload } from './schemas';
import type { PaginatedResponse, User, Order, CartItem, OrderStatus, ApiResponse, Meta } from './types';
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

// TODO: Mover esto a un archivo de tipos si crece mucho - por ahora zfamos.
interface ProductInput {
  name: string;
  description: string;
  price: number | string;
  platformId: string;
  genreId: string;
  type: string;
  developer: string;
  imageUrl?: string;
  trailerUrl?: string;
  stock: number | string;
  specPreset?: string;
  discountPercentage?: number | string;
  discountEndDate?: string | null;
}

export class ApiClient {
  private static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

    // Ojo: Si la respuesta es 204 No Content, no intentamos parsear JSON porque explota.
    if (response.status === 204) {
      return {} as T;
    }

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


  static async login(data: LoginValues) { return this.request<{ success: boolean; token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  static async register(data: RegisterPayload) { return this.request<{ success: boolean; token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }); }
  static async verifyEmail(token: string) { return this.request<{ success: boolean; message: string }>(`/auth/verify?token=${token}`); }

  static async getProfile() {
    try {
      return await this.request<{ success: boolean; user: User }>('/auth/profile');
    } catch (error: any) {
      // Si no estamos autenticados (401), retornamos success: false limpiamente
      // Esto evita que la app explote si el token expiró.
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

    // Usamos 'any' acá temporalmente porque la respuesta cruda del backend puede variar
    // antes de ser normalizada.
    const response = await this.request<any>(`/products${queryString}`, options);

    const emptyMeta: Meta = { total: 0, page: 1, limit: 10, totalPages: 1 };

    // Chequeamos si es array plano o paginado
    let rawProducts: any[] = [];
    let meta: Meta = emptyMeta;

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
        return null; // Filtramos productos rotos para no romper la UI
      }
    }).filter(Boolean) as Product[];

    return {
      products: parsedProducts,
      meta
    };
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await this.request<any>(`/products/${id}`);
    return ProductSchema.parse(response.data || response) as Product;
  }

  static async createProduct(productData: ProductInput) {
    const backendPayload = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(String(productData.price)),
      platform: productData.platformId,
      genre: productData.genreId,
      type: productData.type,
      releaseDate: new Date(),
      developer: productData.developer,
      imageId: productData.imageUrl,
      trailerUrl: productData.trailerUrl,
      stock: parseInt(String(productData.stock)),
      active: true,
      specPreset: productData.specPreset,
      discountPercentage: Number(productData.discountPercentage) || 0,
      discountEndDate: productData.discountEndDate || null,
    };
    return this.request('/products', { method: 'POST', body: JSON.stringify(backendPayload) });
  }

  static async updateProduct(id: string, productData: ProductInput) {
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


  // --- PLATFORMS & GENRES ---

  static async getPlatforms() {
    const res = await this.request<any>('/platforms');
    return res.data || res;
  }
  static async getPlatformById(id: string) { return this.request(`/platforms/${id}`); }
  static async createPlatform(data: { name: string; imageId?: string }) {
    return this.request('/platforms', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updatePlatform(id: string, data: { name?: string; imageId?: string }) {
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
    const res = await this.request<any>('/genres');
    return res.data || res;
  }
  static async getGenreById(id: string) { return this.request(`/genres/${id}`); }
  static async createGenre(data: { name: string; imageId?: string }) {
    return this.request('/genres', { method: 'POST', body: JSON.stringify(data) });
  }
  static async updateGenre(id: string, data: { name?: string; imageId?: string }) {
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


  // --- CART ---

  static async getCart() {
    const data = await this.request<any>('/cart');
    // Si el backend devuelve items populados, intentamos parsear para asegurar integridad
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


  // --- WISHLIST ---

  static async getWishlist(): Promise<Product[]> {
    const response = await this.request<any>('/wishlist');
    if (Array.isArray(response.wishlist)) {
      return response.wishlist.map((item: any) => {
        try { return ProductSchema.parse(item); } catch { return null; }
      }).filter(Boolean) as Product[];
    }
    return [];
  }

  static async toggleWishlist(productId: string) {
    return this.request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) });
  }


  // --- ORDERS ---

  static async createOrder(orderData: Partial<Order>) {
    return this.request('/orders', { method: 'POST', body: JSON.stringify(orderData) });
  }


  static async getUserOrders() {
    return this.request<Order[]>('/orders/user');
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
    return this.request<any>(`/keys/product/${productId}`);
  }

  // --- DASHBOARD (ADMIN) ---
  static async getDashboardStats() {
    const res = await this.request<any>('/dashboard/stats');
    return res.data;
  }

  static async getSalesChart() {
    const res = await this.request<any>('/dashboard/chart');
    return res.data;
  }

  static async getTopProducts() {
    const res = await this.request<any>('/dashboard/top-products');
    return res.data;
  }

  // --- USER MANAGEMENT (ADMIN) ---
  static async getUsers(params: { page?: number; limit?: number; search?: string; role?: string }) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);
    if (params.role && params.role !== 'all') query.append("role", params.role);

    return this.request<any>(`/users?${query.toString()}`);
  }

  static async getUserById(id: string) {
    return this.request<User>(`/users/${id}`);
  }

  static async updateUser(id: string, data: Partial<User>) {
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
