"use client";

import { useCart } from "@/context/CartContext";
import { GameCard } from "@/components/game/game-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8 md:py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8">My Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-2xl font-bold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground">Add games to your wishlist to see them here.</p>
          <Button asChild className="mt-6">
            <Link href="/">Browse Games</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlist.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
