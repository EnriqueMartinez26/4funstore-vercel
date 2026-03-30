'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlist: Game[];
  toggleWishlist: (game: Game) => Promise<void>;
  isInWishlist: (gameId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const wishRes = await ApiClient.getWishlist();
      setWishlist(wishRes);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchWishlist().finally(() => setIsLoading(false));
    } else {
      setWishlist([]);
      setIsLoading(false);
    }
  }, [user, fetchWishlist]);

  const isInWishlist = useCallback((id: string) => wishlist.some(g => g.id === id), [wishlist]);

  const toggleWishlist = useCallback(async (game: Game) => {
    if (!user) {
      toast({ variant: "destructive", title: "Acción requerida", description: "Inicia sesión para guardar favoritos." });
      return;
    }
    const exists = isInWishlist(game.id);
    // Optimistic UI
    setWishlist(prev => exists ? prev.filter(p => p.id !== game.id) : [...prev, game]);
    try {
      await ApiClient.toggleWishlist(game.id);
    } catch {
      // Rollback on error
      await fetchWishlist();
    }
  }, [user, toast, isInWishlist, fetchWishlist]);
  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const c = useContext(WishlistContext);
  if (!c) throw new Error('useWishlist must be used within WishlistProvider');
  return c;
}
