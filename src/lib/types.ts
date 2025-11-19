export type Platform = {
  id: string;
  name: string;
};

export type Genre = {
  id: string;
  name: string;
};

export type Game = {
  id: string;
  name: string;
  description: string;
  price: number;
  platform: Platform;
  genre: Genre;
  type: 'Digital' | 'Physical';
  releaseDate: string;
  developer: string;
  imageId: string;
  rating: number;
  stock?: number;
};

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: 'CLIENTE' | 'ADMIN';
  activo: boolean;
};

export type CarritoItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};
