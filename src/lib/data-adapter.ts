import { allGames as legacyGames } from './data';
import type { Game } from './types';

// Adaptar datos legacy al nuevo formato del backend
export const adaptLegacyGames = (): Game[] => {
  return legacyGames.map(game => ({
    id: game.id,
    nombre: game.name,
    descripcion: game.description,
    precio: game.price,
    plataforma: game.platform,
    genero: game.genre,
    tipo: game.type === 'Physical' ? 'Fisico' : 'Digital',
    fechaLanzamiento: game.releaseDate,
    desarrollador: game.developer,
    imagenUrl: game.imageId,
    calificacion: game.rating,
    stock: 10
  }));
};
