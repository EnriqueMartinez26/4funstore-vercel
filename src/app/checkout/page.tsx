"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Banknote, ShieldCheck, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Steps Definition
const steps = [
  { id: 1, title: 'Dirección', icon: MapPin },
  { id: 2, title: 'Pago', icon: CreditCard },
  { id: 3, title: 'Confirmar', icon: CheckCircle2 },
];

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  const nextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Validate Step 1
    if (currentStep === 1) {
      if (!formData.street || !formData.city || !formData.zipCode) {
        toast({ variant: "destructive", title: "Campos incompletos", description: "Por favor completa la dirección de envío." });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para comprar." });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      userId: user.id,
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
        zip: formData.zipCode,
        country: formData.country
      },
      paymentMethod: formData.paymentMethod,
      itemsPrice: cartTotal,
      shippingPrice: 0,
      totalPrice: cartTotal,
    };

    try {
      const response = await ApiClient.createOrder(orderData as any);

      if (response.paymentLink) {
        toast({ title: "Procesando...", description: "Redirigiendo a Mercado Pago" });
        window.location.href = response.paymentLink;
      } else {
        throw new Error("El sistema de pagos no devolvió un link válido.");
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
    <div className="container mx-auto max-w-screen-lg px-4 py-8 mb-12">
      <h1 className="text-3xl font-bold mb-8 font-headline text-center">Finalizar Compra</h1>

      {/* Stepper */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isActive ? "border-primary bg-primary text-primary-foreground" :
                    isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "ml-2 font-medium hidden sm:inline-block",
                  isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-12 h-[2px] mx-4",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Shipping */}
          {currentStep === 1 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader>
                <CardTitle>Dirección de Envío</CardTitle>
                <CardDescription>¿A dónde enviamos tus juegos?</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="shipping-form" onSubmit={nextStep} className="space-y-4">
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
              <CardFooter className="flex justify-end">
                <Button type="submit" form="shipping-form">
                  Continuar a Pago
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
                <CardDescription>Selecciona cómo quieres abonar.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue={formData.paymentMethod} onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}>
                  <div className={cn("flex items-center space-x-2 border p-4 rounded-md mb-2 cursor-pointer transition-colors", formData.paymentMethod === 'mercadopago' && "border-primary bg-primary/5")}>
                    <RadioGroupItem value="mercadopago" id="mercadopago" />
                    <Label htmlFor="mercadopago" className="flex items-center gap-2 cursor-pointer w-full font-bold">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      Mercado Pago
                      <span className="ml-auto text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">Tarjetas / Efectivo / QR</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>Atrás</Button>
                <Button onClick={() => nextStep()}>Revisar Pedido</Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
              <CardHeader>
                <CardTitle>Revisar y Confirmar</CardTitle>
                <CardDescription>Verifica que todo esté correcto antes de pagar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Dirección de Envío
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.street}, {formData.city}, {formData.zipCode}, {formData.country}
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Método de Pago
                  </h4>
                  <p className="text-sm text-muted-foreground uppercase">
                    {formData.paymentMethod}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>Atrás</Button>
                <Button className="font-bold shadow-md hover:shadow-xl transition-all glow-effect" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                  Confirmar y Pagar
                </Button>
              </CardFooter>
            </Card>
          )}

        </div>

        {/* Sidebar Summary (Visible Always) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate w-2/3 text-muted-foreground font-medium">{item.quantity}x <span className="text-foreground">{item.name}</span></span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t my-4" />
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(cartTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex items-center justify-center text-xs text-muted-foreground">
            <ShieldCheck className="w-3 h-3 mr-1" /> Pago procesado seguro por Mercado Pago
          </div>
        </div>
      </div>
    </div>
  );
}
