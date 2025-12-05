"use client";

import Image from "next/image";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PlatformIcon } from "../icons";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(game.id);
  const hasStock = game.stock !== undefined && game.stock > 0;

  // Manejo de URL de imagen robusto
  const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
    ? game.imageId 
    : "/placeholder.png";

  return (
    <Card 
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border-0 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ring-1 ring-border/50 hover:ring-primary/50"
      aria-labelledby={`game-title-${game.id}`}
    >
      {/* --- SECCIÓN DE IMAGEN (Cover Art) --- */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={`Portada de ${game.name}`}
          fill
          className={cn(
            "object-cover transition-transform duration-700 ease-in-out group-hover:scale-110",
            !hasStock && "grayscale opacity-60"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
        
        {/* Overlay Gradiente para legibilidad (si decidimos poner texto encima) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges Flotantes (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
           {/* Stock Urgency */}
           {hasStock && game.stock! < 5 && (
            <Badge variant="destructive" className="shadow-lg backdrop-blur-md bg-red-500/90 hover:bg-red-600/90 animate-pulse px-2 py-0.5 text-[10px] uppercase tracking-wider">
              <Zap className="w-3 h-3 mr-1 fill-current" />
              ¡Últimos {game.stock}!
            </Badge>
          )}
          {/* Digital vs Physical */}
          <Badge variant="secondary" className="w-fit shadow-lg backdrop-blur-md bg-background/80 hover:bg-background/90 text-[10px] font-bold uppercase tracking-wider border-0">
             {game.type === 'Physical' ? 'Físico' : 'Digital Key'}
          </Badge>
        </div>

        {/* Wishlist Button (Top Right) - Glassmorphism */}
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "absolute top-3 right-3 h-9 w-9 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300",
            isWishlisted 
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600" 
              : "bg-black/40 text-white/80 hover:bg-white hover:text-black"
          )}
          onClick={(e) => {
            e.preventDefault(); // Prevenir navegación si la card es un link
            toggleWishlist(game);
          }}
          aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart className={cn("h-4 w-4 transition-transform active:scale-75", isWishlisted && "fill-current")} />
        </Button>

        {/* Overlay de Agotado */}
        {!hasStock && (
           <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
              <span className="font-headline font-bold text-xl uppercase tracking-widest text-foreground border-2 border-foreground px-4 py-2 rotate-12">
                Agotado
              </span>
           </div>
        )}
      </div>
      
      {/* --- SECCIÓN DE CONTENIDO --- */}
      <CardContent className="flex flex-1 flex-col p-4 gap-3 relative">
        {/* Género y Plataforma */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
           <span className="font-medium px-2 py-0.5 rounded-sm bg-secondary/50">
             {game.genre?.name || 'General'}
           </span>
           <div className="flex items-center gap-1" title={game.platform?.name}>
              <PlatformIcon platformId={game.platform?.id || 'unknown'} className="h-3.5 w-3.5" />
              <span className="uppercase tracking-wide text-[10px] font-bold">{game.platform?.name}</span>
           </div>
        </div>

        {/* Título */}
        <h3 
          id={`game-title-${game.id}`} 
          className="font-headline font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors"
          title={game.name}
        >
          {game.name}
        </h3>

        {/* Precio */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
           <span className="font-bold text-xl text-foreground">
             {formatCurrency(game.price)}
           </span>
           {/* Aquí se podría agregar precio anterior si existiera descuento */}
        </div>
      </CardContent>

      {/* --- FOOTER (Acción) --- */}
      <CardFooter className="p-4 pt-0">
        <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(game);
            }} 
            className={cn(
              "w-full font-bold transition-all duration-300 gap-2 shadow-sm",
              "group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/25"
            )}
            disabled={!hasStock}
            variant={hasStock ? "default" : "secondary"}
        >
          <ShoppingCart className="h-4 w-4" />
          {hasStock ? 'Agregar al Carrito' : 'Sin Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
