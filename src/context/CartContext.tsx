'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/types';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
  wishlist: Game[];
  toggleWishlist: (game: Game) => Promise<void>;
  isInWishlist: (gameId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, token } = useAuth();

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const syncData = async () => {
    try {
      setIsLoading(true);
      // Sincronizar Carrito
      const cartRes = await ApiClient.getCart(user?.id, token ?? undefined);
      setCart(cartRes.cart?.items || []);

      // Sincronizar Wishlist
      if (user?.id) {
        const wishRes = await ApiClient.getWishlist(user.id, token ?? undefined);
        setWishlist(wishRes);
      }
    } catch (error) {
      console.error('Error sincronizando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      syncData();
    } else {
      // Modo Local
      const localCart = localStorage.getItem('cart');
      if (localCart) try { setCart(JSON.parse(localCart)); } catch {}
      setWishlist([]); // Wishlist solo online
      setIsLoading(false);
    }
  }, [user, token]);

  const addToCart = async (product: any, quantity: number = 1) => {
    if (user && token) {
      await ApiClient.addToCart(product.id, quantity, token);
      await syncData();
    } else {
      // Local
      const existing = cart.find(p => p.productId === product.id);
      let newCart = [...cart];
      if (existing) {
         existing.quantity += quantity;
      } else {
         newCart.push({
           id: `loc-${Date.now()}`,
           productId: product.id,
           name: product.name,
           price: product.price,
           quantity,
           image: product.imageId
         });
      }
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
     if (user && token) {
       await ApiClient.updateCartItem(productId, quantity, token);
       await syncData();
     } else {
       const newCart = cart.map(item => item.productId === productId ? {...item, quantity} : item);
       setCart(newCart);
       localStorage.setItem('cart', JSON.stringify(newCart));
     }
  };

  const removeFromCart = async (productId: string) => {
    if (user && token) {
      const item = cart.find(c => c.productId === productId || c.id === productId);
      if(item) {
        await ApiClient.removeFromCart(item.id, token);
        await syncData();
      }
    } else {
      const newCart = cart.filter(item => item.productId !== productId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (user && token) {
      await ApiClient.clearCart(token);
      await syncData();
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  const toggleWishlist = async (game: Game) => {
    if (!user || !token) {
      alert("Inicia sesión para guardar favoritos.");
      return;
    }
    // Optimistic Update
    const exists = isInWishlist(game.id);
    if (exists) {
      setWishlist(prev => prev.filter(p => p.id !== game.id));
    } else {
      setWishlist(prev => [...prev, game]);
    }
    try {
      await ApiClient.toggleWishlist(user.id, game.id, token);
    } catch (error) {
      syncData(); // Revertir si falla
    }
  };

  const isInWishlist = (gameId: string) => wishlist.some(g => g.id === gameId);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isLoading, wishlist, toggleWishlist, isInWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}