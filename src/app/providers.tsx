"use client";

import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/hooks/use-auth"; 

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}