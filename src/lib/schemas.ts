import { z } from "zod";

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
export const ProductSchema = z.object({
  _id: z.string(),
  nombre: z.string(),
  descripcion: z.string(),
  precio: z.number(),
  stock: z.number().default(0),
  imagenUrl: z.string().nullable().optional(),
  // Manejamos el caso de que venga poblado (objeto) o solo ID (string)
  plataformaId: z.union([z.string(), PlatformSchema]),
  generoId: z.union([z.string(), GenreSchema]),
  tipo: z.enum(['Fisico', 'Digital']),
  desarrollador: z.string(),
  calificacion: z.number().default(0),
  fechaLanzamiento: z.string().or(z.date()).optional(), // Añadido campo fecha
}).transform((data) => ({
  // Transformación segura a la interfaz que usa el Frontend
  id: data._id,
  name: data.nombre,
  description: data.descripcion,
  price: data.precio,
  stock: data.stock,
  // Manejo defensivo de imágenes
  imageId: data.imagenUrl && (data.imagenUrl.startsWith('http') || data.imagenUrl.startsWith('/')) 
    ? data.imagenUrl 
    : "/placeholder.png",
  // Normalización de plataforma/género siempre a Objeto
  platform: typeof data.plataformaId === 'object' 
    ? { id: (data.plataformaId as any)._id || (data.plataformaId as any).id, name: data.plataformaId.nombre }
    : { id: 'unknown', name: 'Plataforma' },
  genre: typeof data.generoId === 'object' 
    ? { id: (data.generoId as any)._id || (data.generoId as any).id, name: data.generoId.nombre }
    : { id: 'unknown', name: 'Género' },
  type: data.tipo === 'Fisico' ? 'Physical' : 'Digital',
  developer: data.desarrollador,
  rating: data.calificacion,
  // Mapping de fecha para cumplir con Game
  releaseDate: data.fechaLanzamiento ? new Date(data.fechaLanzamiento).toISOString() : new Date().toISOString()
}));

export type Product = z.infer<typeof ProductSchema>;
