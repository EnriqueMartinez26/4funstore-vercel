import { GameCatalog } from '@/components/game/game-catalog';
import { ApiClient } from '@/lib/api-client';

export default async function ProductosPage() {
  const games = await ApiClient.getProducts();
  
  return (
    <div className="container mx-auto px-4">
      <GameCatalog games={games} />
    </div>
  );
}
