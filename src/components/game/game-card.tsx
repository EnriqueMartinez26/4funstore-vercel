"use client";

import Image from "next/image";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PlatformIcon } from "../icons";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(game.id);

  // Manejo de URL de imagen robusto
  const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
    ? game.imageId 
    : "/placeholder.png";

  return (
    <Card 
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary"
      aria-labelledby={`game-title-${game.id}`}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
             <Image
                src={imageUrl}
                alt={`Portada de ${game.name}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
             />
          {/* Badge de Stock Bajo */}
          {game.stock !== undefined && game.stock > 0 && game.stock < 5 && (
            <Badge variant="destructive" className="absolute left-2 top-2 shadow-sm animate-pulse">
              ¡Solo {game.stock}!
            </Badge>
          )}
          {game.stock === 0 && (
             <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-[2px]">
                <Badge variant="secondary" className="text-lg px-4 py-1">Agotado</Badge>
             </div>
          )}

          <Button
            size="icon"
            variant="ghost"
            className={cn(
                "absolute top-2 right-2 h-9 w-9 rounded-full bg-background/60 backdrop-blur-md hover:bg-background/90 transition-colors shadow-sm",
                isWishlisted ? "text-red-500" : "text-foreground/70 hover:text-red-500"
            )}
            onClick={() => toggleWishlist(game)}
            aria-label={isWishlisted ? `Quitar ${game.name} de favoritos` : `Añadir ${game.name} a favoritos`}
          >
            <Heart className={cn("h-5 w-5", isWishlisted && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle 
            id={`game-title-${game.id}`} 
            className="font-headline text-lg leading-tight line-clamp-2 min-h-[3rem]"
            title={game.name}
          >
            {game.name}
          </CardTitle>
          {/* CORREGIDO: Acceso directo a propiedades de objeto, ya que los tipos lo garantizan */}
          <div className="shrink-0 text-muted-foreground" title={game.platform?.name}>
             <PlatformIcon platformId={game.platform?.id || 'unknown'} />
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-auto">
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                {game.genre?.name || 'General'}
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
                {game.type === 'Physical' ? 'Físico' : 'Digital'}
            </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/40 bg-muted/20 mt-auto">
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Precio</span>
            <p className="font-bold text-xl text-primary">{formatCurrency(game.price)}</p>
        </div>
        <Button 
            onClick={() => addToCart(game)} 
            size="sm" 
            className="shadow-md hover:shadow-lg transition-all active:scale-95"
            disabled={game.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {game.stock === 0 ? 'Sin Stock' : 'Agregar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
