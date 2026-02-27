"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function PendingPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Limpiamos el carrito porque la orden ya fue generada, aunque esté pendiente
    clearCart();
  }, [clearCart]);

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md text-center border-yellow-500/20 bg-yellow-500/5 shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-full mb-4 w-fit">
            <Clock className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-3xl font-headline text-yellow-700 dark:text-yellow-400">
            Pago Pendiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Tu orden ha sido generada. Estamos esperando la confirmación del pago para procesar tu pedido.
          </p>
          <p className="text-sm">
            Si pagaste en efectivo, recuerda que la acreditación puede demorar hasta 48hs.
          </p>

          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold">
              <Link href="/account">Ver Estado del Pedido</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}