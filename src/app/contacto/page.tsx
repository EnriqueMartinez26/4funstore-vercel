"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { Loader2, CheckCircle, Mail, MessageSquare } from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresá un email válido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(1000, "El mensaje no puede superar los 1000 caracteres")
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { firstName: "", lastName: "", email: "", message: "" }
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await ApiClient.sendContactMessage(data);
      setSent(true);
      reset();
      toast({
        title: "¡Mensaje enviado!",
        description: "Te responderemos a la brevedad.",
        className: "bg-green-50 border-green-200 text-green-900"
      });
    } catch (error: any) {
      toast({
        title: "Error al enviar",
        description: error.message || "Hubo un problema al conectar con el servidor.",
        variant: "destructive"
      });
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card className="text-center border-green-500/20 bg-green-500/5">
          <CardContent className="pt-10 pb-8 space-y-4">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-headline font-bold">¡Mensaje enviado!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Recibimos tu consulta correctamente. Te responderemos por email lo antes posible.
            </p>
            <Button variant="outline" onClick={() => setSent(false)} className="mt-4">
              Enviar otro mensaje
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-3xl font-headline">Contacto</CardTitle>
          </div>
          <CardDescription>
            ¿Tenés alguna pregunta? Completá el formulario y nos pondremos en contacto con vos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="nombre@ejemplo.com" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                className="min-h-[120px]"
                placeholder="¿En qué podemos ayudarte?"
                {...register("message")}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message.message}</p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Enviar Mensaje
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}