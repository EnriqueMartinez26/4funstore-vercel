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
import { Loader2, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart(); // Quitamos clearCart de aquí, solo se limpia al pagar
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "mercadopago"
  });

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold mb-4 font-headline">Tu carrito está vacío</h1>
        <Button onClick={() => router.push("/productos")}>Volver a la tienda</Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para comprar." });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      user: user.id,
      orderItems: cart.map(item => ({
        product: item.productId,
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
      shippingPrice: 0, 
      totalPrice: cartTotal,
    };

    try {
      console.log("Enviando orden al backend...");
      const response = await ApiClient.createOrder(orderData);
      console.log("Respuesta del backend:", response);
      
      // LÓGICA CORREGIDA: Si no hay link, es un error.
      if (response.paymentLink) {
        toast({ title: "Procesando...", description: "Redirigiendo a Mercado Pago" });
        window.location.href = response.paymentLink; 
      } else {
        // Si el backend responde OK pero sin link, algo falló en la configuración de MP del backend
        throw new Error("El sistema de pagos no devolvió un link válido. Revisa la consola.");
      }

    } catch (error: any) {
      console.error("Error en checkout:", error);
      toast({ 
        variant: "destructive", 
        title: "Error al iniciar el pago", 
        description: error.message || "No se pudo conectar con Mercado Pago." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-lg px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline">Finalizar Compra</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <RadioGroup defaultValue="mercadopago" onValueChange={(val) => setFormData({...formData, paymentMethod: val})}>
                <div className={`flex items-center space-x-2 border p-4 rounded-md mb-2 transition-colors ${formData.paymentMethod === 'mercadopago' ? 'border-primary bg-primary/5' : ''}`}>
                  <RadioGroupItem value="mercadopago" id="mercadopago" />
                  <Label htmlFor="mercadopago" className="flex items-center gap-2 cursor-pointer w-full font-bold">
                    <CreditCard className="h-5 w-5 text-blue-500" /> 
                    Mercado Pago 
                    <span className="ml-auto text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">Tarjetas / Efectivo / QR</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 sticky top-24">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate w-2/3 text-muted-foreground">{item.quantity}x <span className="text-foreground font-medium">{item.name}</span></span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t my-4" />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full h-12 text-lg font-bold shadow-md hover:shadow-xl transition-all" size="lg" type="submit" form="checkout-form" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Pagar con Mercado Pago
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
