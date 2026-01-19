import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PixelHero } from '@/components/pixel-hero';
// ELIMINADA: import { GameRecommendations } from '@/components/game/recommendations';
import { CategoryCard } from '@/components/game/category-card';
import { ApiClient } from '@/lib/api-client';
// Fallback image
const defaultImage = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600";

export default async function Home() {
  // 1. Fetch data from Backend
  let platformsData: any[] = [];
  let genresData: any[] = [];

  try {
    const [pData, gData] = await Promise.all([
      ApiClient.getPlatforms().catch(() => []),
      ApiClient.getGenres().catch(() => [])
    ]);

    // Handle potential response structures (array or object with data property)
    platformsData = Array.isArray(pData) ? pData : (pData?.data || []);
    genresData = Array.isArray(gData) ? gData : (gData?.data || []);
  } catch (error) {
    console.error("Error fetching home visuals:", error);
  }

  // 2. Map Backend Data to UI Format
  const platforms = platformsData.map((p: any) => ({
    id: p.id,
    name: p.name,
    image: (p.imageId && (p.imageId.startsWith('http') || p.imageId.startsWith('/'))) ? p.imageId : defaultImage
  }));

  const genres = genresData.map((g: any) => ({
    id: g.id,
    name: g.name,
    image: (g.imageId && (g.imageId.startsWith('http') || g.imageId.startsWith('/'))) ? g.imageId : defaultImage
  }));

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Reemplazamos el Hero antiguo con el nuevo PixelHero basado en la imagen sugerida */}
      <PixelHero />

      <div className="container mx-auto px-4 space-y-12 md:space-y-16">
        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-bold md:text-4xl text-center md:text-left">Explorar por Plataforma</h2>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map(platform => (
              <CategoryCard
                key={platform.id}
                title={platform.name}
                image={platform.image}
                href={`/productos?platform=${platform.id}`}
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>
        </section>

        {/* ELIMINADA: Sección de Recomendaciones IA */}

        <section>
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-3xl font-bold md:text-4xl text-center md:text-left">Explorar por Género</h2>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {genres.map(genre => (
              <CategoryCard
                key={genre.id}
                title={genre.name}
                image={genre.image}
                href={`/productos?genre=${genre.id}`}
              />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link href="/productos">Ver todo</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}