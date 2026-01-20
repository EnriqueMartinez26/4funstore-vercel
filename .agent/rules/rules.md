---
trigger: always_on
---

Estructura Next.js 15: "Los nuevos desarrollos deben utilizar exclusivamente el App Router de Next.js 15 y componentes funcionales de React con TypeScript".

Estilizado y UI: "Utiliza únicamente Tailwind CSS para los estilos. Los componentes deben basarse en la biblioteca Radix UI (Shadcn), respetando los tokens de diseño definidos en components.json".

Identidad de Marca: "El nombre del proyecto es estrictamente '4Fun'. Asegúrate de que el logo (Gamepad2) y los colores primarios (Deep Indigo) y de acento (Electric Purple) se apliquen consistentemente en Header, Footer y Hero".

Comunicación con API: "Las peticiones al servidor deben realizarse a través del cliente centralizado api.ts. No uses fetch directamente para evitar inconsistencias en el manejo de tokens y errores".

Iconografía y Assets: "Usa Lucide-react para todos los iconos de la interfaz (como ShoppingCart, Heart, User) para mantener una estética visual uniforme".