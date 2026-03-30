"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingBag } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id"); // ID de Mercado Pago

  useEffect(() => {
    // Limpiamos el carrito al llegar aquí porque el pago fue exitoso
    clearCart();
  }, [clearCart]);

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md text-center border-green-500/20 bg-green-500/5 shadow-2xl">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4 w-fit">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl font-headline text-green-700 dark:text-green-400">
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Gracias por tu compra. Hemos recibido tu pago correctamente y estamos procesando tu pedido.
          </p>

          {paymentId && (
            <div className="bg-background p-3 rounded-md border border-border text-sm font-mono text-muted-foreground">
              ID de Transacción: <span className="text-foreground font-bold">{paymentId}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg" className="font-bold">
              <Link href="/account">Ver Mis Pedidos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/productos">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Seguir Comprando
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}