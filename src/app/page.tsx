import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages as placeholderImages } from '@/lib/placeholder-images';
import { platforms, genres } from '@/lib/data';
import { PlatformIcon } from '@/components/icons';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Home() {
  const heroImage = placeholderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <section className="relative h-[50vh] md:h-[70vh] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-start justify-end p-4 md:p-8 lg:p-12">
          <div className="max-w-2xl space-y-4">
            <h1 className="font-headline text-4xl font-bold md:text-6xl lg:text-7xl">
              Tu Próxima Aventura te Espera
            </h1>
            <p className="text-lg text-foreground/80 md:text-xl">
              Explora un universo de juegos. Desde épicos RPGs hasta shooters de alta velocidad, encuentra tu próximo juego favorito en 4Fun.
            </p>
            <Button size="lg" asChild>
              <Link href="/productos">
                Explorar Todos los Juegos <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-12 md:space-y-16">
        <section>
            <h2 className="font-headline text-3xl font-bold md:text-4xl mb-8 text-center">Explorar por Plataforma</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {platforms.map(platform => (
                    <Link href="/productos" key={platform.id}>
                        <Card className="group relative overflow-hidden rounded-lg text-center flex flex-col items-center justify-center p-6 h-40 transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-xl hover:-translate-y-1">
                            <PlatformIcon platformId={platform.id} className="h-12 w-12 mb-2 text-primary group-hover:text-accent-foreground" />
                            <h3 className="font-headline text-xl font-semibold">{platform.name}</h3>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
        
        <section>
            <h2 className="font-headline text-3xl font-bold md:text-4xl mb-8 text-center">Explorar por Género</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {genres.slice(0, 8).map(genre => (
                     <Button key={genre.id} variant="outline" size="lg" asChild className="justify-start">
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