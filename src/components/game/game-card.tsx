"use client";

import Image from "next/image";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PlaceHolderImages as placeholderImages } from "@/lib/placeholder-images";
import { PlatformIcon } from "../icons";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const gameImage = placeholderImages.find(p => p.id === game.imageId);
  const isWishlisted = isInWishlist(game.id);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] w-full">
          {gameImage && (
             <Image
                src={gameImage.imageUrl}
                alt={game.name}
                data-ai-hint={gameImage.imageHint}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
          )}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
                "absolute top-2 right-2 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/75",
                isWishlisted ? "text-red-500" : "text-foreground"
            )}
            onClick={() => toggleWishlist(game)}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="font-headline text-lg leading-tight">{game.name}</CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
             <PlatformIcon platformId={game.platform.id} />
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{game.genre.name}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="font-semibold text-lg">{formatCurrency(game.price)}</p>
        <Button onClick={() => addToCart(game)} size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
