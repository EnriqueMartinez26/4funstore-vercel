import { z } from "zod";

// Schema para Plataforma (Backend: id, nombre, imageId)
export const PlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageId: z.string().optional().default(""),
});

// Schema para Género
export const GenreSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageId: z.string().optional().default(""),
});

// Schema para Producto (Mapeando respuesta del Backend)
export const ProductSchema = z.preprocess((val: any) => {
  if (typeof val === 'object' && val !== null) {
    // Map _id to id if id is missing
    if (!val.id && val._id) {
      val.id = val._id;
    }
    // Fail-safe for price
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
  platform: z.object({ id: z.string(), name: z.string().optional(), imageId: z.string().optional() }).or(z.string()).optional(),
  genre: z.object({ id: z.string(), name: z.string().optional(), imageId: z.string().optional() }).or(z.string()).optional(),
  type: z.enum(['Digital', 'Physical']).optional().default("Digital").or(z.string().optional().default("Digital")), // Fallback a string si viene algo raro, pero intentamos tipar
  developer: z.string().optional().default("Unknown"),
  rating: z.coerce.number().default(0),
  releaseDate: z.string().or(z.date()).optional(),
  active: z.boolean().optional(),
  trailerUrl: z.string().optional(),
  specPreset: z.enum(['Low', 'Mid', 'High']).optional().or(z.string().optional()),
  requirements: z.object({
    os: z.string().optional().default(''),
    processor: z.string().optional().default(''),
    memory: z.string().optional().default(''),
    graphics: z.string().optional().default(''),
    storage: z.string().optional().default('')
  }).optional(),
  // Discount Fields
  finalPrice: z.coerce.number().default(0),
  discountPercentage: z.coerce.number().default(0),
  discountEndDate: z.string().nullable().optional()
})).transform((data: any) => {

  // Lógica de resolución de Plataforma
  let platformData = { id: 'unknown', name: 'Plataforma', imageId: '' };

  if (data.platform) {
    if (typeof data.platform === 'object') {
      platformData = {
        id: data.platform.id,
        name: data.platform.name || data.platform.id,
        imageId: data.platform.imageId || ""
      };
    } else if (typeof data.platform === 'string') {
      platformData = {
        id: data.platform,
        name: data.platform,
        imageId: ""
      };
    }
  }

  // Lógica de resolución de Género
  let genreData = { id: 'unknown', name: 'Género', imageId: '' };
  if (data.genre) {
    if (typeof data.genre === 'object') {
      genreData = {
        id: data.genre.id,
        name: data.genre.name || data.genre.id,
        imageId: data.genre.imageId || ""
      };
    } else if (typeof data.genre === 'string') {
      genreData = {
        id: data.genre,
        name: data.genre,
        imageId: ""
      };
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    stock: data.stock,
    // Estructura de imagen unificada
    imageId: data.imageId && (data.imageId.startsWith('http') || data.imageId.startsWith('/'))
      ? data.imageId
      : "https://placehold.co/600x400/png?text=4Fun",
    platform: platformData,
    genre: genreData,
    type: (data.type === 'Fisico' || data.type === 'Physical') ? 'Physical' : 'Digital',
    developer: data.developer,
    rating: data.rating,
    releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString() : new Date().toISOString(),
    active: data.active,
    trailerUrl: data.trailerUrl,
    specPreset: data.specPreset,
    requirements: data.requirements,
    // Discount
    finalPrice: data.finalPrice || data.price,
    discountPercentage: data.discountPercentage || 0,
    discountEndDate: data.discountEndDate
  };
});

export type Product = Omit<z.infer<typeof ProductSchema>, 'type'> & { type: 'Digital' | 'Physical' };

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const RegisterSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type LoginValues = z.infer<typeof LoginSchema>;
export type RegisterValues = z.infer<typeof RegisterSchema>;
export type RegisterPayload = Omit<RegisterValues, 'confirmPassword'>;
