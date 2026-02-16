"use client";

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Heart, Zap, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import type { Game } from '@/lib/types';
import Link from 'next/link';

interface FeaturedGameProps {
  title?: string;
  description?: string;
  price?: number;
  tags?: string[];
  imageUrl?: string;
}

export const PixelHero = ({
  title = "Cyber Odyssey",
  description = "Explora una metrópolis distópica en este RPG de mundo abierto. Tus decisiones moldean la historia.",
  price = 59.99,
  tags = ["RPG", "Cyberpunk", "Open World"],
  imageUrl = "https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
}: FeaturedGameProps) => {
  const { addToCart } = useCart();

  // Mock Game Object para que funque el carrito
  const gameObj: Game = {
    id: 'featured-1',
    name: title,
    description: description,
    price: price,
    finalPrice: price,
    platform: { id: 'pc', name: 'PC', imageId: '' },
    genre: { id: 'rpg', name: 'RPG', imageId: '' },
    type: 'Digital',
    releaseDate: '2024-01-01',
    developer: 'Neon Studios',
    imageId: 'cyber-odyssey',
    rating: 5,
    stock: 100
  };

  return (
    <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 lg:py-32">
      {/* Fondo "Pixel/Grid" */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Columna Texto */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700 fade-in">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-primary font-mono uppercase tracking-wider border-primary/20 bg-primary/5">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="space-y-4">
              <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary drop-shadow-sm">
                {title}
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl font-body leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => addToCart(gameObj)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Comprar {formatCurrency(price)}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-primary/10 hover:bg-primary/5 hover:border-primary/30 text-foreground transition-all"
                asChild
              >
                <Link href="/productos">
                  Explorar Catálogo <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Columna Imagen (Card Flotante) */}
          <div className="relative group perspective-1000 animate-in slide-in-from-right duration-700 fade-in delay-200">
            {/* Elemento decorativo detrás */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <Card className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card p-2 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Overlay tipo "Glitch" / Tech */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <div className="flex items-center gap-2 text-foreground font-mono bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
                    <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold tracking-widest">FEATURED ITEM</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};