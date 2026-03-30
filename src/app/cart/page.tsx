"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getImageUrl } from "@/lib/utils";
import { Trash2, ShoppingBag, LogIn, UserPlus } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { user } = useAuth();

  // ── Guest gate ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="container mx-auto max-w-screen-lg px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-20 w-20 text-muted-foreground mb-6" />
        <h1 className="font-headline text-3xl md:text-4xl font-bold mb-3">
          ¡Casi listo para comprar!
        </h1>
        <p className="text-muted-foreground text-lg mb-2">
          Necesitás una cuenta para agregar productos al carrito y realizar compras.
        </p>
        <p className="text-muted-foreground mb-8">
          Es gratis, rápido y te da acceso a descuentos, historial de pedidos y mucho más.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">
              <UserPlus className="mr-2 h-5 w-5" />
              Crear cuenta gratis
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" />
              Ya tengo cuenta
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mt-8">
          Solo mirando?{" "}
          <Link href="/productos" className="text-primary underline-offset-4 hover:underline">
            Seguí explorando juegos →
          </Link>
        </p>
      </div>
    );
  }

  // ── Authenticated user ────────────────────────────────────────────────────
  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8 md:py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8">Tu Carrito</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-2xl font-bold">Tu carrito está vacío</h2>
          <p className="mt-2 text-muted-foreground">
            Parece que aún no has agregado nada a tu carrito.
          </p>
          <Button asChild className="mt-6">
            <Link href="/productos">Comenzar a Comprar</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const imageUrl = getImageUrl(
                item.image,
                "https://placehold.co/600x400/png?text=Sin+Imagen"
              );
              return (
                <Card key={item.id} className="flex items-center p-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={imageUrl}
                      alt={item.name || "Producto"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-headline font-semibold">{item.name || "Desconocido"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.platform?.name || "Juego"}
                    </p>
                    <p className="text-sm font-bold mt-1">{formatCurrency(item.price || 0)}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="h-9 w-16 text-center"
                      aria-label="Cantidad"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1 sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} productos)</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span className="text-muted-foreground text-sm">Calculado al pagar</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link href="/checkout">Proceder al Pago</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}