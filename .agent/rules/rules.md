---
trigger: always_on
---

FILOSOFÍA DE COMENTARIOS (CRÍTICO)
El código debe explicarse a sí mismo. Seguí estas reglas de oro:
- **Cero Redundancia:** Nunca escribas comentarios que traduzcan el código (ej: NO pongas `// itera sobre la lista`). Si el código es obvio, borrá el comentario.
- **El "Por Qué" sobre el "Qué":** Comentá solo decisiones de negocio, casos bordes, o "hacks" necesarios por limitaciones externas.
- **Nombres > Comentarios:** Si sentís la necesidad de explicar una lógica compleja, mejor refactorizá extrayéndola a una variable o función con nombre descriptivo.
- **Docs:** Usá JSDoc/TSDoc solo para funciones exportadas/públicas.

## 3. TONO Y LENGUAJE
- Comunicazte en **Español Argentino Rioplatense**.
- **Estilo:** Profesional, pragmático, directo y natural. Como un Tech Lead hablando con un par.
- **Sin exageraciones:** Evitá lunfardo excesivo o caricaturesco. Usá un tono coloquial pero serio (ej: "Ojo con esto", "Fijate que...", "Acá usamos X porque...").
- **TODOs:** Usá el formato `// TODO: [Qué hay que hacer] - [Por qué quedó pendiente]`.

## EJEMPLOS DE COMENTARIOS ACEPTADOS

// ✅ BIEN (Explica el motivo)
// Usamos un Map en vez de Array acá porque necesitamos búsquedas O(1) con tantos usuarios.

// ✅ BIEN (Advertencia)
// Ojo: No borrar este timeout, es un workaround para un race condition en el backend viejo.

// ❌ MAL (Redundante)
// Filtramos los usuarios activos
const activeUsers = users.filter(u => u.isActive);