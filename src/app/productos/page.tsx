import { GameCatalog } from '@/components/game/game-catalog';
import { ApiClient } from '@/lib/api';

export default async function ProductosPage() {
  // Nota: Esto se ejecuta en el servidor al cargar la página por primera vez. Cacheamos por 60s.
  const response = await ApiClient.getProducts({ page: 1, limit: 8 }, { next: { revalidate: 60 } });

  // Extraemos el array, ya sea que venga directo o dentro de un objeto
  const games = (Array.isArray(response) ? response : response.products) as any as import('@/lib/types').Game[];

  return (
    <div className="container mx-auto px-4">
      {/* Pasamos los juegos iniciales */}
      <GameCatalog initialGames={games} />
    </div>
  );
}