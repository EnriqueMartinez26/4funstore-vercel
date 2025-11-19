const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `Error ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Network error or server is unavailable',
      0,
      error
    );
  }
}

export const api = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { name: string; email: string; password: string }) =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: (token: string) =>
      apiRequest('/auth/logout', { method: 'POST', token }),
    getProfile: (token: string) =>
      apiRequest('/auth/profile', { method: 'GET', token }),
  },

  // Products
  products: {
    getAll: (params?: { category?: string; search?: string }) => {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      return apiRequest(`/products${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => apiRequest(`/products/${id}`),
    create: (data: unknown, token: string) =>
      apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    update: (id: string, data: unknown, token: string) =>
      apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),
    delete: (id: string, token: string) =>
      apiRequest(`/products/${id}`, { method: 'DELETE', token }),
  },

  // Categories
  categories: {
    getAll: () => apiRequest('/categories'),
    getById: (id: string) => apiRequest(`/categories/${id}`),
    create: (data: unknown, token: string) =>
      apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
  },

  // Cart
  cart: {
    get: (token: string) => apiRequest('/cart', { method: 'GET', token }),
    add: (productId: string, quantity: number, token: string) =>
      apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
        token,
      }),
    update: (itemId: string, quantity: number, token: string) =>
      apiRequest(`/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
        token,
      }),
    remove: (itemId: string, token: string) =>
      apiRequest(`/cart/${itemId}`, { method: 'DELETE', token }),
    clear: (token: string) =>
      apiRequest('/cart/clear', { method: 'DELETE', token }),
  },

  // Orders
  orders: {
    getAll: (token: string) => apiRequest('/orders', { method: 'GET', token }),
    getById: (id: string, token: string) =>
      apiRequest(`/orders/${id}`, { method: 'GET', token }),
    create: (data: unknown, token: string) =>
      apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
  },
};

export default api;
