'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { Game } from '@/lib/types';
import { useToast } from '@/hooks/use-toast'; // Feedback visual añadido

export interface CartItem {
  id: string; productId: string; name: string; price: number; quantity: number; image?: string;
  // Campos normalizados para evitar errores de renderizado
  platform?: { name: string };
}

interface CartContextType {
  cart: CartItem[]; addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>; updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>; cartTotal: number; cartCount: number; isLoading: boolean;
  wishlist: Game[]; toggleWishlist: (game: Game) => Promise<void>; isInWishlist: (gameId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth(); // Ya no necesitamos 'token'
  const { toast } = useToast();

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCart = async () => {
    try {
      const cartRes = await ApiClient.getCart(user?.id);
      setCart(cartRes.cart?.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const fetchWishlist = async () => {
    if (!user?.id) return;
    try {
      const wishRes = await ApiClient.getWishlist(user.id);
      setWishlist(wishRes);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  // Sincronización robusta
  const syncData = async () => {
    setIsLoading(true);
    await Promise.all([fetchCart(), fetchWishlist()]);
    setIsLoading(false);
  };

  // Efecto principal de carga
  useEffect(() => {
    if (user) {
      syncData();
    } else {
      // Modo Invitado: Cargar de LocalStorage
      const local = localStorage.getItem('cart');
      if (local) {
        try { setCart(JSON.parse(local)); } catch { setCart([]); }
      }
      setWishlist([]);
      setIsLoading(false);
    }
  }, [user]); // Dependencia solo de user

  const addToCart = async (product: any, quantity = 1) => {
    // Normalización de datos para evitar inconsistencias visuales
    const newItem = {
      id: `temp-${Date.now()}`, // ID temporal para UI optimista
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.imageId || product.image,
      platform: product.platform
    };

    if (user) {
      // Estrategia: Actualización Optimista (Optimistic UI)
      setCart(prev => [...prev, newItem]);
      try {
        await ApiClient.addToCart(user.id, product.id, quantity);
        await fetchCart(); // Solo resincronizar carrito para obtener IDs reales
        toast({ title: "Agregado al carrito", description: `${product.name} añadido.` });
      } catch (e) {
        setCart(prev => prev.filter(i => i.id !== newItem.id)); // Rollback
        toast({ variant: "destructive", title: "Error", description: "No se pudo agregar al carrito." });
      }
    } else {
      // Local
      setCart(prev => {
        const exist = prev.find(p => p.productId === product.id);
        let newCart;
        if (exist) {
          newCart = prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + quantity } : p);
        } else {
          newCart = [...prev, { ...newItem, id: `loc-${Date.now()}` }];
        }
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
      toast({ title: "Agregado al carrito (Local)", description: `${product.name} añadido.` });
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    if (user) {
      // Optimistic Update
      const oldCart = [...cart];
      setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
      try {
        await ApiClient.updateCartItem(user.id, itemId, quantity);
      } catch {
        setCart(oldCart); // Rollback
      }
    } else {
      const newCart = cart.map(i => i.id === itemId ? { ...i, quantity } : i);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (user) {
      const oldCart = [...cart];
      setCart(prev => prev.filter(i => i.id !== itemId));
      try {
        await ApiClient.removeFromCart(user.id, itemId);
      } catch {
        setCart(oldCart);
      }
    } else {
      const newCart = cart.filter(i => i.id !== itemId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    if (user) {
      setCart([]);
      await ApiClient.clearCart(user.id);
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  };

  const toggleWishlist = async (game: Game) => {
    if (!user) {
      toast({ variant: "destructive", title: "Acción requerida", description: "Inicia sesión para guardar favoritos." });
      return;
    }
    const exists = isInWishlist(game.id);
    // Optimistic UI
    setWishlist(prev => exists ? prev.filter(p => p.id !== game.id) : [...prev, game]);
    try { await ApiClient.toggleWishlist(user.id, game.id); } catch { syncData(); }
  };

  const isInWishlist = (id: string) => wishlist.some(g => g.id === id);

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
  const c = useContext(CartContext);
  if (!c) throw new Error('Use in provider');
  return c;
}