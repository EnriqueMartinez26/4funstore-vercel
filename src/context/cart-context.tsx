"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Game, CarritoItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api-client";
import { useUser } from "@/firebase/auth/use-user";

interface CartContextType {
  cart: CarritoItem[];
  wishlist: Game[];
  addToCart: (game: Game) => Promise<void>;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleWishlist: (game: Game) => void;
  isInWishlist: (gameId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CarritoItem[]>([]);
  const [wishlist, setWishlist] = useState<Game[]>([]);
  const { toast } = useToast();
  const { user } = useUser();

  // Sincronizar carrito con el backend cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      syncCart();
    }
  }, [user]);

  const syncCart = async () => {
    if (!user) return;
    
    try {
      const backendCart = await ApiClient.getCart(user.uid);
      setCart(backendCart.items || []);
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  const addToCart = async (game: Game) => {
    if (user) {
      try {
        await ApiClient.addToCart(user.uid, game.id, 1);
        await syncCart();
        toast({
          title: "Added to cart",
          description: `${game.nombre} has been added to your cart.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } else {
      // Lógica local si no hay usuario
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.producto.id === game.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.producto.id === game.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        }
        return [...prevCart, { id: Date.now().toString(), producto: game, cantidad: 1 }];
      });
      toast({
        title: "Added to cart",
        description: `${game.nombre} has been added to your cart.`,
      });
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    toast({
      title: "Removed from cart",
      variant: 'destructive'
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, cantidad: quantity } : item
        )
      );
    }
  };

  const toggleWishlist = (game: Game) => {
    setWishlist((prevWishlist) => {
      const isInWishlist = prevWishlist.some((item) => item.id === game.id);
      if (isInWishlist) {
        toast({
            title: "Removed from wishlist",
            description: `${game.nombre} has been removed from your wishlist.`,
            variant: 'destructive'
          });
        return prevWishlist.filter((item) => item.id !== game.id);
      } else {
        toast({
            title: "Added to wishlist",
            description: `${game.nombre} is now in your wishlist.`,
          });
        return [...prevWishlist, game];
      }
    });
  };

  const isInWishlist = (gameId: string) => {
    return wishlist.some((item) => item.id === gameId);
  };
  
  const cartTotal = cart.reduce((total, item) => total + item.producto.precio * item.cantidad, 0);
  const cartCount = cart.reduce((count, item) => count + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
