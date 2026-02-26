<p align="center">
  <h1 align="center">🎮 4Fun Store — Frontend</h1>
  <p align="center">
    Interfaz web moderna para marketplace de videojuegos.<br/>
    Desarrollado como proyecto de tesis — <strong>Mariano Martinez</strong>.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Radix_UI-Components-161618?logo=radixui&logoColor=white" alt="Radix UI">
</p>

---

## 📋 Tabla de Contenido

- [Descripción](#-descripción)
- [Tech Stack](#-tech-stack)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Páginas](#-páginas)
- [Diseño](#-diseño)
- [Backend](#-backend)

---

## 📖 Descripción

Frontend del marketplace **4Fun Store**, una SPA construida con **Next.js 15** (App Router + Turbopack) que ofrece:

- 🎮 **Catálogo de juegos** con filtros por plataforma, género y precio
- 🔍 **Búsqueda global** con diálogo dedicado
- 🛒 **Carrito de compras** con estado persistente
- ❤️ **Wishlist** para guardar juegos favoritos
- ⚖️ **Comparador de juegos** side-by-side
- 💳 **Checkout** integrado con MercadoPago
- 👤 **Gestión de cuenta** con historial de órdenes
- ⭐ **Reseñas** de productos
- 📊 **Panel admin** con dashboard, gestión de productos/usuarios/órdenes
- 📧 **Formulario de contacto**
- ✅ **Verificación de email** al registrarse

---

## 🛠 Tech Stack

| Categoría         | Tecnología                                  |
|-------------------|---------------------------------------------|
| Framework         | Next.js 15 (App Router, Turbopack)          |
| Lenguaje          | TypeScript 5                                |
| UI Components     | Radix UI (20+ componentes primitivos)       |
| Styling           | Tailwind CSS 3.4 + tailwindcss-animate      |
| Animaciones       | Framer Motion                               |
| Formularios       | React Hook Form + Zod                       |
| Gráficos          | Recharts                                    |
| HTTP Client       | Axios                                       |
| Carrusel          | Embla Carousel                              |
| Fechas            | date-fns                                    |
| Iconos            | Lucide React + iconos pixel-art custom      |

---

## 📁 Estructura del Proyecto

```
Proyecto-Front/src/
├── app/                  # Páginas (App Router)
│   ├── account/          # Mi cuenta
│   ├── admin/            # Panel administrador
│   │   ├── orders/       # Gestión de órdenes
│   │   ├── products/     # ABM de productos
│   │   ├── users/        # Gestión de usuarios
│   │   └── visuals/      # Configuración visual
│   ├── cart/             # Carrito de compras
│   ├── checkout/         # Proceso de pago
│   │   ├── success.tsx   # Pago exitoso
│   │   ├── failure.tsx   # Pago fallido
│   │   └── pending.tsx   # Pago pendiente
│   ├── comparar/         # Comparador de juegos
│   ├── contacto/         # Formulario de contacto
│   ├── login/            # Inicio de sesión
│   ├── register/         # Registro
│   ├── productos/        # Catálogo y detalle
│   ├── verificar-email/  # Verificación de email
│   └── wishlist/         # Lista de deseos
├── components/           # Componentes reutilizables
│   ├── admin/            # Componentes del panel admin
│   ├── game/             # Cards, detalles, filtros de juegos
│   ├── layout/           # Header, Footer, Navbar
│   ├── ui/               # 34 componentes base (Radix + shadcn)
│   ├── pixel-hero.tsx    # Hero section con estilo pixel-art
│   └── search-dialog.tsx # Búsqueda global
├── context/              # React Context
│   ├── CartContext.tsx    # Estado del carrito
│   ├── ComparatorContext.tsx  # Estado del comparador
│   └── WishlistContext.tsx    # Estado de la wishlist
├── hooks/                # Custom hooks
│   ├── use-auth.tsx      # Autenticación
│   ├── use-debounce.ts   # Debounce para búsquedas
│   ├── use-game-filter.ts    # Filtros de juegos
│   ├── use-image-upload.ts   # Subida de imágenes
│   ├── use-mobile.tsx    # Detección de mobile
│   └── use-toast.ts      # Notificaciones toast
└── lib/                  # Utilidades
    ├── api.ts            # Cliente API (Axios)
    ├── constants.ts      # Constantes
    ├── logger.ts         # Logger frontend
    ├── schemas.ts        # Esquemas Zod
    ├── types.ts          # TypeScript types
    └── utils.ts          # Utilidades generales
```

---

## 🚀 Instalación

```bash
# 1. Ir al directorio del frontend
cd Proyecto-Front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar con la URL del backend

# 4. Iniciar en modo desarrollo (Turbopack)
npm run dev

# Disponible en http://localhost:9002
```

### Scripts disponibles

| Script          | Descripción                     |
|-----------------|---------------------------------|
| `npm run dev`   | Desarrollo con Turbopack (9002) |
| `npm run build` | Build de producción             |
| `npm run start` | Servir build de producción      |
| `npm run lint`  | Linting con ESLint              |
| `npm run typecheck` | Verificar tipos TypeScript |

---

## 🎨 Diseño

Siguiendo el blueprint del proyecto:

- **Color primario:** Deep Indigo (`#4B0082`)
- **Fondo:** Light Lavender (`#E6E6FA`)
- **Acento:** Electric Purple (`#BF00FF`)
- **Tipografía headlines:** Space Grotesk (sans-serif)
- **Tipografía body:** Inter (sans-serif)
- **Iconografía:** Estilo pixel-art para géneros y plataformas
- **Layout:** Grid responsivo para catálogo
- **Animaciones:** Framer Motion (fade-in, hover states, transiciones)

---

## 🔗 Backend

La API REST se encuentra en el directorio `Proyecto-Back/`. Consulta el [README del Backend](../Proyecto-Back/README.md) para documentación completa de endpoints.

---

## 📜 Licencia

MIT © Mariano Martinez
