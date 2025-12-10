export type Platform = {
  id: string;
  name: string;
};

export type Genre = {
  id: string;
  name: string;
};

// Coincide 1:1 con el toResponseDTO del Backend
export type Game = {
  id: string;
  name: string;
  description: string;
  price: number;
  platform: Platform; // Objeto completo
  genre: Genre;       // Objeto completo
  type: 'Digital' | 'Physical';
  releaseDate: string;
  developer: string;
  imageId: string;    // Mapeado desde imagenUrl
  rating: number;
  stock: number;
  active?: boolean;
};

// Unificamos User (eliminamos duplicidad de 'Usuario')
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  platformName?: string;
};

// Respuesta API Genérica
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
};