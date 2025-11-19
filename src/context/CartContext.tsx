'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';

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
  total: number;
  itemCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calcular cantidad de items
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Sincronizar carrito con el backend
  const syncCart = async () => {
    try {
      setIsLoading(true);
      const cartData = await ApiClient.getCart(token ?? undefined);
      setCart(cartData.items || []);
    } catch (error) {
      console.error('Error al sincronizar carrito:', error);
      // Si falla, cargar del localStorage
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar carrito en localStorage
  const saveToLocalStorage = (cartItems: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  useEffect(() => {
    if (user && token) {
      syncCart();
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
      setIsLoading(false);
    }
  }, [user, token]);

  // Agregar al carrito
  const addToCart = async (product: any, quantity: number = 1) => {
    try {
      if (user && token) {
        await ApiClient.addToCart(product.id, quantity, token ?? undefined);
        await syncCart();
      } else {
        // Carrito local
        const existingItem = cart.find(item => item.productId === product.id);
        let newCart: CartItem[];
        
        if (existingItem) {
          newCart = cart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newCart = [
            ...cart,
            {
              id: Date.now().toString(),
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: product.image,
            },
          ];
        }
        
        setCart(newCart);
        saveToLocalStorage(newCart);
      }
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      throw error;
    }
  };

  // Actualizar cantidad
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      if (user && token) {
        await ApiClient.updateCartItem(productId, quantity, token ?? undefined);
        await syncCart();
      } else {
        const newCart = cart.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
        setCart(newCart);
        saveToLocalStorage(newCart);
      }
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      throw error;
    }
  };

  // Remover del carrito
  const removeFromCart = async (productId: string) => {
    try {
      if (user && token) {
        await ApiClient.removeFromCart(productId, token ?? undefined);
        await syncCart();
      } else {
        const newCart = cart.filter(item => item.productId !== productId);
        setCart(newCart);
        saveToLocalStorage(newCart);
      }
    } catch (error) {
      console.error('Error al remover del carrito:', error);
      throw error;
    }
  };

  // Limpiar carrito
  const clearCart = async () => {
    try {
      if (user && token) {
        await ApiClient.clearCart(token ?? undefined);
        await syncCart();
      } else {
        setCart([]);
        localStorage.removeItem('cart');
      }
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      throw error;
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}