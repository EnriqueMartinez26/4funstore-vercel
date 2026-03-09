import { ProductSchema, type Product, LoginSchema, RegisterSchema, type LoginValues, type RegisterValues, type RegisterPayload } from './schemas';
import type { PaginatedResponse, User, Order, CartItem, OrderStatus, ApiResponse, Meta, Review, ReviewStats, ProductInput } from './types';
import { z } from 'zod';
import { Logger } from './logger';

const getBaseUrl = () => {
  // En el browser usamos URL relativa para que las peticiones pasen por el proxy
  // de Next.js (rewrites en next.config.ts). Esto evita problemas de CORS con
  // credentials: 'include' y garantiza que el backend reciba las peticiones
  // (necesario para el envío de emails al registrarse).
  if (typeof window !== 'undefined') {
    return '';
  }
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
  if (baseUrl && !baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  return baseUrl;
};

export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
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
      ...options.headers as any
    };

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    // Ojo: Si la respuesta es 204 No Content, no intentamos parsear JSON porque explota.
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // Normalizamos el mensaje de error para evitar que sea un Objeto y rompa React
      let errorMessage: string | undefined;

      // Estructura del backend: { error: { message, details } }
      if (data.error && typeof data.error === 'object') {
        errorMessage = data.error.message;
        // Si hay detalles de validación, usarlos
        if (Array.isArray(data.error.details) && data.error.details.length > 0) {
          errorMessage = data.error.details.join('. ');
        }
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }

      // Fallback: data.message o data.errors (express-validator)
      if (!errorMessage) errorMessage = data.message;
      if (!errorMessage && Array.isArray(data.errors)) {
        errorMessage = data.errors.map((e: any) => typeof e === 'string' ? e : (e.msg || e.message)).join(', ');
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


  static async login(data: LoginValues) { return this.request<{ success: boolean; token: string; user: User }>('/auth/login', { method: 'POST', cache: 'no-store', body: JSON.stringify(data) }); }
  static async register(data: RegisterPayload) { return this.request<{ success: boolean; token: string; user: User }>('/auth/register', { method: 'POST', cache: 'no-store', body: JSON.stringify(data) }); }
  static async verifyEmail(token: string) { return this.request<{ success: boolean; message: string }>(`/auth/verify?token=${token}`); }

  static async getProfile(options?: RequestInit) {
    try {
      return await this.request<{ success: boolean; user: User }>('/auth/profile', { cache: 'no-store', ...options });
    } catch (error: any) {
      // Si no estamos autenticados (401), retornamos success: false limpiamente
      // Esto evita que la app explote si el token expiró.
      if (error.status === 401 || error?.response?.status === 401 || (error instanceof ApiError && error.status === 401)) {
        return { success: false, user: null };
      }
      throw error;
    }
  }
  static async logout() { return this.request('/auth/logout', { method: 'POST', cache: 'no-store' }); }

  static async updateProfile(data: { name?: string; avatar?: string | null; phone?: string | null; address?: string | null }) {
    return this.request<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      cache: 'no-store',
      body: JSON.stringify(data)
    });
  }

  static async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.request<{ success: boolean; message: string }>('/auth/password', {
      method: 'PUT',
      cache: 'no-store',
      body: JSON.stringify(data)
    });
  }


  static async uploadImage(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxlbwdqop';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '4fun_preset';

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
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
    minPrice?: number;
    maxPrice?: number;
  }, options?: RequestInit): Promise<PaginatedResponse<Product>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.platform && params.platform !== 'all') query.append("platform", params.platform);
    if (params?.genre && params.genre !== 'all') query.append("genre", params.genre);
    if (params?.sort) query.append("sort", params.sort);
    if (params?.discounted) query.append("discounted", "true");
    if (params?.minPrice !== undefined && params.minPrice > 0) query.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append("maxPrice", params.maxPrice.toString());

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
    const res = await this.request<any>('/platforms', { next: { revalidate: 120 } } as any);
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
    const res = await this.request<any>('/genres', { next: { revalidate: 120 } } as any);
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
    const data = await this.request<any>('/cart', { cache: 'no-store' });
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
          ...item, id: item._id, productId: parsedProduct?.id || item.product?.id || item.product?._id,
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
    const response = await this.request<any>('/wishlist', { cache: 'no-store' });
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


  static async getUserOrders(): Promise<Order[]> {
    const res = await this.request<any>('/orders/user', { cache: 'no-store' });
    // Backend devuelve { success, count, orders } — extraemos el array
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.orders)) return res.orders;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  }

  // Admin: listar todas las órdenes con paginación y filtros
  static async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ orders: Order[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.status && params.status !== "all") query.append("status", params.status);
    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await this.request<any>(`/orders${qs}`, { cache: 'no-store' });
    return {
      orders: res.orders || [],
      total: res.total || 0,
      page: res.page || 1,
      totalPages: res.totalPages || 1,
    };
  }

  // Admin: actualizar estado de una orden
  static async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await this.request<any>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.order || res;
  }

  // Admin: marcar orden como pagada
  static async markOrderAsPaid(orderId: string): Promise<Order> {
    const res = await this.request<any>(`/orders/${orderId}/pay`, {
      method: 'PUT',
    });
    return res.order || res;
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


  // --- REVIEWS ---

  static async getProductReviews(productId: string, params?: { page?: number; limit?: number; sort?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.sort) query.append('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; reviews: Review[]; pagination: Meta }>(`/reviews/product/${productId}${qs}`);
  }

  static async getProductRatingStats(productId: string) {
    return this.request<{ success: boolean; data: ReviewStats }>(`/reviews/product/${productId}/stats`);
  }

  static async createReview(productId: string, data: { rating: number; title?: string; text: string }) {
    return this.request<{ success: boolean; data: Review }>(`/reviews/product/${productId}`, {
      method: 'POST',
      cache: 'no-store',
      body: JSON.stringify(data)
    });
  }

  static async voteReviewHelpful(reviewId: string) {
    return this.request<{ success: boolean; data: { helpfulCount: number; voted: boolean } }>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
      cache: 'no-store'
    });
  }

  static async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, { method: 'DELETE' });
  }
}
