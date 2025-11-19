"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "tarjeta"
  });

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
        <Button onClick={() => router.push("/productos")}>Volver a la tienda</Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para comprar." });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      user: user.id,
      orderItems: cart.map(item => ({
        product: item.productId, // ID del producto
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      },
      paymentMethod: formData.paymentMethod,
      itemsPrice: cartTotal,
      shippingPrice: 0, // Gratis por ahora
      totalPrice: cartTotal,
    };

    try {
      await ApiClient.createOrder(orderData, token);
      await clearCart(); // Limpiar carrito en frontend y backend
      
      toast({ title: "¡Pedido realizado!", description: "Gracias por tu compra." });
      router.push("/account"); // Redirigir a historial
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo procesar el pedido." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Dirección de Envío</CardTitle></CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Calle y Número</Label><Input name="street" required value={formData.street} onChange={handleChange} placeholder="Av. Siempreviva 742" /></div>
                  <div className="space-y-2"><Label>Ciudad</Label><Input name="city" required value={formData.city} onChange={handleChange} placeholder="Springfield" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Provincia/Estado</Label><Input name="state" required value={formData.state} onChange={handleChange} /></div>
                  <div className="space-y-2"><Label>Código Postal</Label><Input name="zipCode" required value={formData.zipCode} onChange={handleChange} /></div>
                  <div className="space-y-2"><Label>País</Label><Input name="country" required value={formData.country} onChange={handleChange} /></div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Método de Pago</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup defaultValue="tarjeta" onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
                <div className="flex items-center space-x-2 border p-4 rounded-md mb-2">
                  <RadioGroupItem value="tarjeta" id="tarjeta" />
                  <Label htmlFor="tarjeta" className="flex items-center gap-2 cursor-pointer w-full"><CreditCard className="h-4 w-4" /> Tarjeta de Crédito/Débito</Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md">
                  <RadioGroupItem value="transferencia" id="transferencia" />
                  <Label htmlFor="transferencia" className="flex items-center gap-2 cursor-pointer w-full"><Banknote className="h-4 w-4" /> Transferencia Bancaria</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-1 sticky top-24">
          <Card>
            <CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate w-2/3">{item.quantity}x {item.name}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total a Pagar</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" type="submit" form="checkout-form" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Confirmar Compra
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}