const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Métodos para productos
  static async getProducts() {
    return this.request('/productos');
  }

  static async getProductById(id: string) {
    return this.request(`/productos/${id}`);
  }

  // Métodos para usuarios
  static async login(email: string, password: string) {
    return this.request('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(userData: any) {
    return this.request('/usuarios/registro', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Métodos para carrito
  static async addToCart(userId: string, productId: string, cantidad: number) {
    return this.request('/carrito/agregar', {
      method: 'POST',
      body: JSON.stringify({ usuarioId: userId, productoId: productId, cantidad }),
    });
  }

  static async getCart(userId: string) {
    return this.request(`/carrito/${userId}`);
  }

  // Métodos para pedidos
  static async createOrder(orderData: any) {
    return this.request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  static async getUserOrders(userId: string) {
    return this.request(`/pedidos/usuario/${userId}`);
  }
}