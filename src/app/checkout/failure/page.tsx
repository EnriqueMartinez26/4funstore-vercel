"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw } from "lucide-react";

export default function FailurePage() {
  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md text-center border-red-500/20 bg-red-500/5 shadow-xl">
        <CardHeader>
          <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-4 w-fit">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-3xl font-headline text-red-700 dark:text-red-400">
            Pago Rechazado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Hubo un problema al procesar tu pago. No se ha realizado ningún cargo a tu cuenta.
          </p>
          
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold">
              <Link href="/checkout">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar Nuevamente
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/contacto">Reportar un problema</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}