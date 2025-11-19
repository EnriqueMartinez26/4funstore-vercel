"use client";

import Image from "next/image";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PlatformIcon } from "../icons";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(game.id);

  // Lógica mejorada de imagen:
  // 1. Si es URL http, úsala. 2. Si es string corto, usa placeholder.
  const imageUrl = game.imageId.startsWith('http') 
    ? game.imageId 
    : "/placeholder.png"; // Asegúrate de tener una imagen placeholder.png en /public

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] w-full bg-muted">
             <Image
                src={imageUrl}
                alt={game.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
          <Button
            size="icon"
            variant="ghost"
            className={cn(
                "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/75",
                isWishlisted ? "text-red-500" : "text-foreground"
            )}
            onClick={() => toggleWishlist(game)}
            aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-headline text-lg leading-tight line-clamp-2">{game.name}</CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
             {/* Manejo seguro del objeto plataforma */}
             <PlatformIcon platformId={typeof game.platform === 'string' ? game.platform : game.platform?.id} />
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
           {typeof game.genre === 'object' ? game.genre.name : game.genre}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="font-semibold text-lg">{formatCurrency(game.price)}</p>
        <Button onClick={() => addToCart(game)} size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Agregar
        </Button>
      </CardFooter>
    </Card>
  );
}