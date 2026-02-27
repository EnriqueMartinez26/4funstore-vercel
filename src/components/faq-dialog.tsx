"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "¿Cómo recibo mi juego después de la compra?",
    answer:
      "Una vez que tu pago sea aprobado, recibirás las claves de activación (keys) directamente en tu correo electrónico. También podés verlas en la sección 'Mi Cuenta' → 'Mis Pedidos'."
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Aceptamos todos los métodos de pago disponibles a través de MercadoPago: tarjetas de crédito y débito, transferencia bancaria, Mercado Crédito, y pagos en efectivo por Rapipago o Pago Fácil."
  },
  {
    question: "¿Puedo devolver un juego?",
    answer:
      "Debido a la naturaleza digital de nuestros productos, las ventas son finales una vez que la clave fue entregada. Si tenés problemas con una key, contactanos y te ayudaremos a resolverlo."
  },
  {
    question: "¿Cuánto tarda en llegar mi key?",
    answer:
      "La entrega es inmediata. Una vez que MercadoPago confirma tu pago, las claves se asignan automáticamente y se envían a tu email en cuestión de segundos."
  },
  {
    question: "¿Es seguro comprar acá?",
    answer:
      "Sí. Todos los pagos son procesados de forma segura por MercadoPago, y las claves digitales que vendemos son 100% originales y legítimas."
  },
  {
    question: "¿Cómo activo mi key?",
    answer:
      "Depende de la plataforma: en Steam, andá a 'Juegos' → 'Activar un producto en Steam'. En PlayStation Store o Xbox, buscá 'Canjear código' en la tienda. Te enviamos las instrucciones junto con la key."
  },
  {
    question: "¿Tienen soporte técnico?",
    answer:
      "Sí, podés contactarnos a través del formulario de contacto en nuestra web. Respondemos dentro de las 24 horas hábiles."
  },
  {
    question: "¿Puedo pagar en cuotas?",
    answer:
      "Sí, las opciones de cuotas dependen del medio de pago que selecciones en MercadoPago. Generalmente, las tarjetas de crédito permiten pagar en hasta 12 cuotas."
  }
];

interface FaqDialogProps {
  children: React.ReactNode;
}

export function FaqDialog({ children }: FaqDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <HelpCircle className="h-6 w-6 text-primary" />
            Preguntas Frecuentes
          </DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full mt-2">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
