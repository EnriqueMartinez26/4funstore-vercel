import { z } from "zod";

// Diccionarios de traducción (ID -> Nombre legible)
const PLATFORM_NAMES: Record<string, string> = {
  'ps5': 'PlayStation 5',
  'xbox': 'Xbox Series X',
  'switch': 'Nintendo Switch',
  'pc': 'PC',
  'multi': 'Multiplataforma'
};

const GENRE_NAMES: Record<string, string> = {
  'action': 'Acción',
  'rpg': 'RPG',
  'strategy': 'Estrategia',
  'adventure': 'Aventura',
  'sports': 'Deportes',
  'puzzle': 'Puzzle',
  'racing': 'Carreras',
  'shooter': 'Disparos',
  'simulation': 'Simulación'
};

// Schema para Plataforma (Backend: id, nombre)
export const PlatformSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});

// Schema para Género
export const GenreSchema = z.object({
  id: z.string(),
  nombre: z.string(),
});

// Schema para Producto (Mapeando respuesta del Backend)
export const ProductSchema = z.preprocess((val: any) => {
  if (typeof val === 'object' && val !== null) {
    // Map _id to id if id is missing
    if (!val.id && val._id) {
      val.id = val._id;
    }
    // Fail-safe for price: ensure it's not undefined/NaN before coercion
    if (val.price === undefined || val.price === null || isNaN(Number(val.price))) {
      val.price = 0;
    }
    // Fail-safe for name
    if (!val.name) {
      val.name = "Unknown Product";
    }
  }
  return val;
}, z.object({
  id: z.string().optional().default("missing-id"),
  name: z.string().default("Unknown Product"),
  description: z.string().optional().default(""),
  price: z.coerce.number().default(0),
  stock: z.coerce.number().default(0),
  imageId: z.string().nullable().optional(),
  // Backend returns objects for platform/genre now
  platform: z.object({ id: z.string(), name: z.string() }).or(z.string()).optional(),
  genre: z.object({ id: z.string(), name: z.string() }).or(z.string()).optional(),
  type: z.string().optional().default("Digital"),
  developer: z.string().optional().default("Unknown"),
  rating: z.coerce.number().default(0),
  releaseDate: z.string().or(z.date()).optional(),
  active: z.boolean().optional(),
  trailerUrl: z.string().optional(),
})).transform((data: any) => {

  // Lógica de resolución de Plataforma
  let platformData = { id: 'unknown', name: 'Plataforma' };
  if (data.platform && typeof data.platform === 'object') {
    const pId = data.platform.id;
    platformData = {
      id: pId,
      name: PLATFORM_NAMES[pId] || data.platform.name || pId
    };
  } else if (typeof data.platform === 'string') {
    const pId = data.platform;
    platformData = {
      id: pId,
      name: PLATFORM_NAMES[pId] || pId
    };
  }

  // Lógica de resolución de Género
  let genreData = { id: 'unknown', name: 'Género' };
  if (data.genre && typeof data.genre === 'object') {
    const gId = data.genre.id;
    genreData = {
      id: gId,
      name: GENRE_NAMES[gId] || data.genre.name || gId
    };
  } else if (typeof data.genre === 'string') {
    const gId = data.genre;
    genreData = {
      id: gId,
      name: GENRE_NAMES[gId] || gId
    };
  }

  return {
    id: data.id, // ID is direct now
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    // Backend sends 'imageId' directly which is the URL
    imageId: data.imageId && (data.imageId.startsWith('http') || data.imageId.startsWith('/'))
      ? data.imageId
      : "https://placehold.co/600x400/png?text=4Fun",
    platform: platformData,
    genre: genreData,
    type: data.type === 'Fisico' ? 'Physical' : 'Digital',
    developer: data.developer,
    rating: data.rating,
    releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString() : new Date().toISOString(),
    active: data.active,
    trailerUrl: data.trailerUrl
  };
});

export type Product = z.infer<typeof ProductSchema>;
