# Roadmap de Mejoras - Proyecto Tesis

Este documento recopila ideas y sugerencias para elevar la calidad del proyecto a un nivel profesional y "premium", abarcando UX/UI, funcionalidad y arquitectura.

## 1. Experiencia de Usuario (UX) y Diseño (UI)

### Admin Panel
- [x] **Tablero de Control (Dashboard):** Implementar una página de inicio para el admin (`/admin`) con métricas clave:
    - Total de ventas del mes.
    - Productos con bajo stock (Low Stock Alert).
    - Nuevos usuarios registrados.
    - Gráfico de ingresos últimos 30 días (usando `Recharts`).
- [ ] **Separación de Contexto:** Mover la gestión de "Visuales" (Plataformas/Géneros) a su propia ruta `/admin/visuals` en lugar de anidarla debajo de Productos.
- [ ] **Feedback de Carga:** Reemplazar spinners de pantalla completa por **Skeleton Loaders** que imiten la estructura de la tabla, dando sensación de velocidad.
- [ ] **Gestión de Imágenes:** Mejorar la UX de subida de imágenes:
    - Soporte "Drag & Drop".
    - Barra de progreso real visual.
    - Recorte/Preview de imagen antes de subir.

### Cliente / Tienda
- [ ] **Búsqueda Avanzada:** Implementar una barra de búsqueda global con autocompletado en el header (Cmd+K).
- [x] **Filtros Dinámicos:** En la página de catálogo, agregar filtros laterales por Precio (Slider), Plataforma y Género (Checkboxes).
- [x] **Vista Rápida (Quick View):** Permitir ver detalles del producto en un modal sin salir del catálogo.
- [x] **Transiciones:** Utilizar `framer-motion` para animar la entrada de productos en la grilla y pasos del checkout.

## 2. Funcionalidad

- [ ] **Historial de Auditoría:** Registrar quién modificó qué producto (importante para sistemas multi-admin).
- [ ] **Gestión de Órdenes:** Panel para ver y cambiar estado de pedidos (Pendiente -> Enviado -> Entregado).
- [ ] **Checkout Real:** Integrar una pasarela de pago ficticia o real (Stripe/MercadoPago en modo sandbox).
- [ ] **Lista de Deseos (Wishlist):** Finalizar implementación (si está inconclusa).
- [x] **Comparador de Productos:** Seleccionar 2-3 juegos y comparar atributos.

## 3. SEO y Performance

- [ ] **Metadata Dinámica:** Asegurar que cada página de producto tenga `generateMetadata` configurado para SEO (título, descripción, open graph images).
- [ ] **Optimización de Fuentes:** Usar `next/font` para cargar Google Fonts localmente.
- [ ] **Lazy Loading:** Asegurar que componentes pesados (como mapas o gráficos) se carguen bajo demanda.

## 4. Calidad de Código y Arquitectura

- [ ] **Server Actions:** Migrar fetches de cliente a Server Actions de Next.js para mejor seguridad y performance (donde aplique).
- [ ] **Tests:** Agregar tests unitarios básicos (Jest/Vitest) para utilidades y componentes críticos.
- [ ] **Manejo de Errores Global:** Implementar `error.tsx` en las rutas para capturar fallos inesperados elegantemente.

---
*Generado por Antigravity AI*
