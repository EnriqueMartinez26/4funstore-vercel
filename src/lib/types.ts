// Entidad de Referencia Unificada (Backend Standard DTO)
export interface ReferenceEntity {
  id: string;
  name: string;
  imageId: string; // Visual URL
  active?: boolean;
}

export type Platform = ReferenceEntity;
export type Genre = ReferenceEntity;
export type Category = ReferenceEntity;

// Re-exportamos Product de schemas como Game para compatibilidad.
// Game y Product son la MISMA entidad. Usar Product para código nuevo.
import type { Product } from './schemas';
export type Game = Product;
export type { Product } from './schemas';

export interface ProductInput {
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

// Unificamos User (eliminamos duplicidad de 'Usuario')
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  isVerified?: boolean;
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
  platform?: { name: string };
};

// Metadata de Paginación
export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Respuesta Paginada Estandarizada
export type PaginatedResponse<T> = {
  products: T[];
  meta: Meta;
};

// Respuesta API Genérica (Legacy support if needed, or update to use Meta)
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Meta;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// --- REVIEWS ---

export type ReviewSentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

export interface Review {
  id: string;
  user: { id: string; name: string; avatar?: string | null };
  productId: string;
  rating: number;
  title: string;
  text: string;
  sentiment: ReviewSentiment | null;
  sentimentScore: number | null;
  sentimentKeywords: string[];
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
  sentiment: Record<string, number>;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: CartItem[]; // Backend puede devolver 'orderItems' o 'items'
  orderItems?: CartItem[];
  total: number;
  totalPrice?: number; // Alias común
  status: OrderStatus;
  orderStatus?: string; // Backend raw status
  isPaid?: boolean;
  digitalKeys?: { productoId: string; clave: string }[];
  createdAt: string;
  shippingAddress: {
    fullName?: string; // Puede no venir
    street: string;
    city: string;
    zip: string;
    country: string;
    state?: string;
  };
  paymentMethod: string;
  shippingPrice?: number;
  itemsPrice?: number;
  paymentLink?: string; // Para checkout
}