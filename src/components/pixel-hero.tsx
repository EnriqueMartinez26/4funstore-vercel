"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ShoppingCart, Zap, ArrowRight, ChevronLeft, ChevronRight, Percent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Game } from '@/lib/types';
import type { Product } from '@/lib/schemas';
import { ApiClient } from '@/lib/api';
import Link from 'next/link';

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export const PixelHero = () => {
  const { addToCart } = useCart();
  const [games, setGames] = useState<Product[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const fetchDiscounted = async () => {
      try {
        const res = await ApiClient.getProducts({ discounted: true, limit: 50 });
        const withRealDiscount = res.products.filter(
          (p) => (p.discountPercentage ?? 0) > 0 && p.finalPrice < p.price
        );
        if (withRealDiscount.length > 0) {
          setGames(withRealDiscount);
        }
      } catch (e) {
        console.error("Error fetching discounted products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounted();
  }, []);

  const navigate = useCallback((direction: number) => {
    if (games.length === 0 || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(prev => (prev + direction + games.length) % games.length);
      setTransitioning(false);
    }, 300);
  }, [games.length, transitioning]);

  useEffect(() => {
    if (games.length <= 1) return;
    const interval = setInterval(() => navigate(1), 6000);
    return () => clearInterval(interval);
  }, [games.length, navigate]);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <Percent className="h-12 w-12 text-primary/40 animate-spin" />
            <p className="text-muted-foreground font-mono">Cargando ofertas...</p>
          </div>
        </div>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />
        <div className="container relative z-10 mx-auto px-4 text-center space-y-4">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary">Sin ofertas activas</h2>
          <p className="text-muted-foreground text-lg">Volvé pronto para ver las mejores ofertas.</p>
          <Button variant="outline" size="lg" asChild>
            <Link href="/productos">Explorar Catálogo <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    );
  }

  const game = games[current];
  const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
    ? game.imageId : DEFAULT_IMAGE;

  const gameObj: Game = {
    id: game.id,
    name: game.name,
    description: game.description,
    price: game.price,
    finalPrice: game.finalPrice,
    platform: game.platform,
    genre: game.genre,
    type: game.type as 'Digital' | 'Physical',
    releaseDate: game.releaseDate,
    developer: game.developer,
    imageId: game.imageId,
    rating: game.rating,
    stock: game.stock,
    discountPercentage: game.discountPercentage,
    discountEndDate: game.discountEndDate,
  };

  const hasDiscount = (game.discountPercentage ?? 0) > 0 && game.finalPrice < game.price;

  return (
    <section className="relative w-full overflow-hidden bg-background py-12 md:py-24 lg:py-28">
      {/* Fondo Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-transparent to-background z-0" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header de sección */}
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5">
            <Zap className="h-4 w-4 text-green-400 fill-green-400" />
            <span className="text-sm font-bold text-green-400 tracking-wider uppercase font-mono">Ofertas Destacadas</span>
          </div>
          {games.length > 1 && (
            <span className="text-xs text-muted-foreground font-mono">{current + 1}/{games.length}</span>
          )}
        </div>

        <div className={cn(
          "grid gap-8 lg:grid-cols-2 lg:gap-16 items-center transition-all duration-300",
          transitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}>

          {/* Columna Texto */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {hasDiscount && (
                <Badge className="bg-green-500 text-white font-mono text-sm px-3 py-1 animate-pulse">
                  -{game.discountPercentage}% OFF
                </Badge>
              )}
              <Badge variant="secondary" className="text-primary font-mono uppercase tracking-wider border-primary/20 bg-primary/5">
                {game.platform?.name || 'Digital'}
              </Badge>
              <Badge variant="secondary" className="text-primary font-mono uppercase tracking-wider border-primary/20 bg-primary/5">
                {game.genre?.name || 'Game'}
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-foreground drop-shadow-sm line-clamp-2">
                {game.name}
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-base md:text-lg font-body leading-relaxed line-clamp-3">
                {game.description}
              </p>
            </div>

            {/* Bloque de precios */}
            <div className="flex items-end gap-3">
              {hasDiscount && (
                <span className="text-xl md:text-2xl text-muted-foreground line-through decoration-red-500/60">
                  {formatCurrency(game.price)}
                </span>
              )}
              <span className={cn(
                "text-3xl md:text-4xl font-bold",
                hasDiscount ? "text-green-400" : "text-primary"
              )}>
                {formatCurrency(game.finalPrice)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg h-14 px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                onClick={() => addToCart(gameObj)}
                disabled={game.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {game.stock > 0 ? `Comprar ${formatCurrency(game.finalPrice)}` : 'Agotado'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 border-2 border-primary/10 hover:bg-primary/5 hover:border-primary/30 text-foreground transition-all"
                asChild
              >
                <Link href={`/productos/${game.id}`}>
                  Ver Detalle <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Navegación del Carousel */}
            {games.length > 1 && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-full border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex gap-1.5">
                  {games.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i !== current) {
                          setTransitioning(true);
                          setTimeout(() => { setCurrent(i); setTransitioning(false); }, 300);
                        }
                      }}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === current
                          ? "w-8 bg-primary"
                          : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                      aria-label={`Ir a oferta ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => navigate(1)}
                  className="p-2 rounded-full border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Columna Imagen — Box Art Vertical con fondo blur */}
          <div className="relative group animate-in slide-in-from-right duration-700 fade-in delay-200">
            <div className="absolute -inset-2 bg-gradient-to-r from-green-500/30 to-primary/30 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <Link href={`/productos/${game.id}`}>
              <Card className="relative overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-2xl transition-transform duration-500 hover:scale-[1.01] cursor-pointer">
                {/* Contenedor con aspect ratio fijo */}
                <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-black">
                  {/* Fondo Blur — la misma imagen desenfocada */}
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="object-cover scale-110 blur-2xl opacity-40"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    aria-hidden="true"
                  />

                  {/* Imagen principal vertical centrada */}
                  <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
                    <div className="relative h-full aspect-[3/4] rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                      <Image
                        src={imageUrl}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                        sizes="300px"
                      />
                    </div>
                  </div>

                  {/* Overlay con info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="flex items-center gap-2 text-white font-mono bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      <Zap className="h-4 w-4 text-green-400 fill-green-400" />
                      <span className="text-xs font-bold tracking-widest">OFERTA DESTACADA</span>
                    </div>
                  </div>

                  {/* Badge de descuento */}
                  {hasDiscount && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white font-bold text-sm px-3 py-1.5 rounded-lg shadow-lg z-10">
                      -{game.discountPercentage}%
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};