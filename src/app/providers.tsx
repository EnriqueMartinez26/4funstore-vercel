"use client";

import { ComparatorProvider } from "@/context/ComparatorContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/hooks/use-auth";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ComparatorProvider>
            {children}
          </ComparatorProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}