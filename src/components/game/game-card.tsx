"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Heart, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { QuickViewModal } from "./quick-view-modal";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const { toggleWishlist, isInWishlist } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const isWishlisted = isInWishlist(game.id);
  const hasStock = game.stock !== undefined && game.stock > 0;
  const hasDiscount = (game.discountPercentage ?? 0) > 0 && game.finalPrice < game.price;

  // Fallback robusto para la imagen
  const imageUrl = (game.imageId && (game.imageId.startsWith('http') || game.imageId.startsWith('/')))
    ? game.imageId
    : "https://placehold.co/600x400/png?text=4Fun";

  return (
    <>
      <QuickViewModal game={game} open={showQuickView} onOpenChange={setShowQuickView} />

      <Link href={`/productos/${game.id}`} className="block h-full cursor-pointer" prefetch={false}>
        <Card
          className="group relative flex h-full flex-col overflow-hidden rounded-lg border-0 bg-transparent shadow-none transition-all duration-300 hover:bg-transparent"
          aria-labelledby={`game-title-${game.id}`}
        >
          {/* --- COVER ART --- */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
            <Image
              src={imageUrl}
              alt={`Portada de ${game.name}`}
              fill
              className={cn(
                "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                !hasStock && "grayscale opacity-60"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />

            {/* Actions Overlay (Top Right) */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <Button
                size="icon"
                variant="secondary"
                className={cn(
                  "h-8 w-8 rounded-full backdrop-blur-md shadow-sm",
                  isWishlisted ? "text-red-500 bg-white/90" : "text-foreground bg-background/80"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(game);
                }}
              >
                <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 rounded-full backdrop-blur-md shadow-sm text-foreground bg-background/80 hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowQuickView(true);
                }}
                title="Vista Rápida"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Details Overlay (Hover) */}
            <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-white/90 text-black backdrop-blur-sm border-0 font-bold">
                  {game.platform?.name || 'Plataforma'}
                </Badge>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-black/60 text-white backdrop-blur-sm border border-white/10">
                  {game.genre?.name || 'Género'}
                </Badge>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-primary/90 text-primary-foreground backdrop-blur-sm border-0">
                  {game.type === 'Physical' ? 'Físico' : 'Key'}
                </Badge>
              </div>
            </div>

            {/* Badges Overlay (Top Left) */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {!hasStock && (
                <Badge variant="destructive" className="bg-red-500/90 shadow-sm text-[10px]">Agotado</Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-green-500/90 shadow-sm text-[10px] animate-pulse">
                  -{game.discountPercentage}%
                </Badge>
              )}
            </div>
          </div>

          {/* --- DATA --- */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col gap-0.5">
              <h3
                id={`game-title-${game.id}`}
                className="font-headline font-bold text-sm md:text-base leading-tight text-foreground truncate max-w-[180px] group-hover:text-primary transition-colors"
                title={game.name}
              >
                {game.name}
              </h3>
            </div>

            <div className="flex flex-col items-end">
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                  {formatCurrency(game.price)}
                </span>
              )}
              <span className={cn(
                "font-bold text-base md:text-lg bg-transparent",
                hasDiscount ? "text-green-400" : "text-foreground"
              )}>
                {formatCurrency(game.finalPrice)}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </>
  );
}
