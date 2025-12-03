import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { platforms, genres } from '@/lib/data';
import { PlatformIcon } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { PixelHero } from '@/components/pixel-hero'; // Importamos el nuevo componente
import { GameRecommendations } from '@/components/game/recommendations'; // Asegurarnos de que las recomendaciones se mantengan

export default function Home() {
  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {/* Reemplazamos el Hero antiguo con el nuevo PixelHero basado en la imagen sugerida */}
      <PixelHero />

      <div className="container mx-auto px-4 space-y-12 md:space-y-16">
        <section>
            <h2 className="font-headline text-3xl font-bold md:text-4xl mb-8 text-center">Explorar por Plataforma</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {platforms.map(platform => (
                    <Link href="/productos" key={platform.id}>
                        <Card className="group relative overflow-hidden rounded-lg text-center flex flex-col items-center justify-center p-6 h-40 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-xl hover:-translate-y-1 border-primary/10">
                            <PlatformIcon platformId={platform.id} className="h-12 w-12 mb-2 text-primary group-hover:text-accent-foreground transition-colors" />
                            <h3 className="font-headline text-xl font-semibold">{platform.name}</h3>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
        
        {/* Recomendaciones IA (Mantenemos esta feature existente) */}
        <GameRecommendations />

        <section>
            <h2 className="font-headline text-3xl font-bold md:text-4xl mb-8 text-center">Explorar por Género</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {genres.slice(0, 8).map(genre => (
                     <Button key={genre.id} variant="outline" size="lg" asChild className="justify-start border-primary/10 hover:border-primary/30 hover:bg-primary/5">
                        <Link href="/productos">
                           {genre.name}
                        </Link>
                    </Button>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
}