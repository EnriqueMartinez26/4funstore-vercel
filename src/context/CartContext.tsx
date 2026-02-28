'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/lib/types';

interface CartContextType {
  cart: CartItem[]; addToCart: (product: any, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>; updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>; cartTotal: number; cartCount: number; isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCart = async () => {
    try {
      const cartRes = await ApiClient.getCart();
      setCart(cartRes.cart?.items || []);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchCart().finally(() => setIsLoading(false));
    } else {
      const local = localStorage.getItem('cart');
      if (local) {
        try { setCart(JSON.parse(local)); } catch { setCart([]); }
      }
      setIsLoading(false);
    }
  }, [user]);

  const addToCart = useCallback(async (product: any, quantity = 1) => {
    const newItem = {
      id: `temp-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.imageId || product.image,
      platform: product.platform
    };

    if (user) {
      try {
        await ApiClient.addToCart(product.id, quantity);
        await fetchCart(); // Reemplaza todo usando Source of Truth
        toast({ title: "Agregado al carrito", description: `${product.name} añadido.` });
      } catch (e: any) {
        const errorMessage = e?.message || "No se pudo agregar al carrito.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
      }
    } else {
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
  }, [user, toast]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    if (user) {
      const oldCart = [...cart];
      setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
      try {
        await ApiClient.updateCartItem(itemId, quantity);
      } catch {
        setCart(oldCart);
      }
    } else {
      const newCart = cart.map(i => i.id === itemId ? { ...i, quantity } : i);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  }, [user, cart]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (user) {
      const oldCart = [...cart];
      setCart(prev => prev.filter(i => i.id !== itemId));
      try {
        await ApiClient.removeFromCart(itemId);
      } catch {
        setCart(oldCart);
      }
    } else {
      const newCart = cart.filter(i => i.id !== itemId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  }, [user, cart]);

  const clearCart = useCallback(async () => {
    if (user) {
      setCart([]);
      await ApiClient.clearCart();
    } else {
      setCart([]);
      localStorage.removeItem('cart');
    }
  }, [user]);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount, isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used within CartProvider');
  return c;
}