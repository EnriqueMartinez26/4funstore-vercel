import { GameCatalog } from '@/components/game/game-catalog';
import { ApiClient } from '@/lib/api';

export default async function ProductosPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { genre, platform, search } = await searchParams;

  const response = await ApiClient.getProducts({
    page: 1,
    limit: 12,
    sort: '-createdAt',
    genre: genre as string,
    platform: platform as string,
    search: search as string
  }, { next: { revalidate: 60 } });

  const games = (Array.isArray(response) ? response : response.products) as any as import('@/lib/types').Game[];
  const totalPages = Array.isArray(response) ? 1 : (response.meta?.totalPages || 1);

  return (
    <div className="container mx-auto px-4">
      <GameCatalog initialGames={games} initialTotalPages={totalPages} />
    </div>
  );
}