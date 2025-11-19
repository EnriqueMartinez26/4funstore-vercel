"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteger la ruta: si no hay usuario, redirigir al login
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null; // Evita parpadeos mientras redirige

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          ¡Bienvenido de nuevo, {user.name || 'Jugador'}!
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu cuenta, revisa tus pedidos y administra tu lista de deseos.
        </p>
      </header>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="orders">Historial de Pedidos</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pedidos</CardTitle>
              <CardDescription>
                Una lista de tus compras recientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
               <div className="text-center py-16 text-muted-foreground">
                 <p>Aún no has realizado ningún pedido.</p>
                 <Button variant="link" asChild className="mt-2">
                    <Link href="/productos">Ir a la tienda</Link>
                 </Button>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
           <Card>
            <CardHeader>
              <CardTitle>Datos de la Cuenta</CardTitle>
              <CardDescription>
                Información personal asociada a tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid gap-1">
                 <span className="font-semibold">Nombre:</span>
                 <span className="text-muted-foreground">{user.name}</span>
               </div>
               <div className="grid gap-1">
                 <span className="font-semibold">Email:</span>
                 <span className="text-muted-foreground">{user.email}</span>
               </div>
               <div className="grid gap-1">
                 <span className="font-semibold">Rol:</span>
                 <span className="text-muted-foreground capitalize">{user.role}</span>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}