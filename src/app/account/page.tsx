"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Key, Package, Calendar } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface DigitalKey {
  _id: string;
  productoId: string;
  clave: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  orderItems: any[];
  digitalKeys?: DigitalKey[];
}

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      ApiClient.getUserOrders(user.id)
        .then((res) => {
          if (res.success) setOrders(res.orders);
        })
        .catch(console.error)
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          ¡Hola, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes tus juegos y claves digitales.
        </p>
      </header>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
          <TabsTrigger value="settings">Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {loadingOrders ? (
            <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Aún no has comprado nada.</p>
                <Button variant="link" asChild className="mt-2 text-primary">
                  <Link href="/productos">Ir a la tienda</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order._id} className="overflow-hidden border-l-4 border-l-primary/50">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Orden #{order._id.slice(-6)}
                        <Badge variant={order.isPaid ? "default" : "secondary"}>
                          {order.isPaid ? "Pagado" : "Pendiente"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(order.totalPrice)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <span className="font-medium">{item.name} <span className="text-xs text-muted-foreground">x{item.quantity}</span></span>

                        {/* Visualización de Claves Digitales */}
                        {order.isPaid && order.digitalKeys && (
                          <div className="flex flex-col items-end gap-1">
                            {order.digitalKeys
                              .filter((k) => k.productoId === item.product || k.productoId === item.product?._id)
                              .map((k, kIdx) => (
                                <div key={kIdx} className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-md text-xs font-mono border border-green-500/20">
                                  <Key className="h-3 w-3" />
                                  {k.clave}
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Cuenta</CardTitle>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}