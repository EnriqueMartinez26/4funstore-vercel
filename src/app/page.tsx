import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PixelHero } from '@/components/pixel-hero';
// ELIMINADA: import { GameRecommendations } from '@/components/game/recommendations';
import { CategoryCard } from '@/components/game/category-card';
import { ApiClient } from '@/lib/api';
// Fallback image
const defaultImage = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600";

export default async function Home() {
  // 1. Fetch data del Backend
  let platformsData: any[] = [];
  let genresData: any[] = [];

  try {
    const [pData, gData] = await Promise.all([
      ApiClient.getPlatforms().catch(() => []),
      ApiClient.getGenres().catch(() => [])
    ]);

    // Manejamos estructura de respuesta (Array vs Objeto)
    platformsData = Array.isArray(pData) ? pData : (pData?.data || []);
    genresData = Array.isArray(gData) ? gData : (gData?.data || []);
  } catch (error) {
    console.error("Error fetching home visuals:", error);
  }

  // 2. Mapeo data Backend -> UI
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
      <PixelHero />

      {/* Sección: Explorar por Plataforma */}
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-16">
        {/* Fondo Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

        <div className="container relative z-10 mx-auto px-4">
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
        </div>
      </section>

      {/* Sección: Explorar por Género */}
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-16">
        {/* Fondo Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

        <div className="container relative z-10 mx-auto px-4">
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
        </div>
      </section>
    </div>
  );
}