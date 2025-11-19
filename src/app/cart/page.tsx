"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PlaceHolderImages as placeholderImages } from "@/lib/placeholder-images";
import { Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8 md:py-12">
      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-8">Tu Carrito</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 font-headline text-2xl font-bold">Tu carrito está vacío</h2>
          <p className="mt-2 text-muted-foreground">Parece que aún no has agregado nada a tu carrito.</p>
          <Button asChild className="mt-6">
            <Link href="/productos">Comenzar a Comprar</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              // Intentar buscar imagen local si existe, sino usar la del producto
              const image = placeholderImages.find(p => p.id === item.imageId);
              const imageUrl = image ? image.imageUrl : (item.image || "/placeholder.png");

              return (
                <Card key={item.id} className="flex items-center p-4">
                  <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                     <Image 
                       src={imageUrl} 
                       alt={item.name} 
                       fill 
                       className="object-cover" 
                     />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-headline font-semibold">{item.name}</h3>
                    {/* Si tienes plataforma en el item, muéstrala, si no, ocúltalo o pon algo genérico */}
                    <p className="text-sm text-muted-foreground">
                      {item.platform?.name || 'Videojuego'}
                    </p>
                    <p className="text-sm font-bold mt-1">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                      className="h-9 w-16 text-center"
                      aria-label="Cantidad"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label="Eliminar producto">
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
                <Button className="w-full" size="lg">Proceder al Pago</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}