# Navegación responsive

## Decisión

La navegación autenticada se mantiene disponible tanto en dashboard como en
administración, pero cambia de presentación según el viewport:

- `lg` y superiores (`1024px`): sidebar fijo a la derecha.
- Sidebar expandido: `18rem` aproximadamente.
- Sidebar colapsado: `5.75rem`, con iconos y títulos accesibles.
- Menor a `1024px`: barra superior compacta y drawer desde la derecha.

## Interacción y accesibilidad

El botón del sidebar expone `aria-label`, `title` y el estado activo. El drawer
usa `aria-expanded`, `aria-controls`, `role="dialog"` y `aria-modal`. Se puede
cerrar desde el botón, el overlay, Escape o al seleccionar una ruta. Mientras
está abierto se bloquea el scroll del documento y el foco vuelve al botón que
lo abrió al cerrarlo.

## Responsividad de superficies

El contenido y footer reservan espacio a la derecha únicamente cuando existe
el sidebar permanente. En móvil no se reserva espacio lateral. Encabezados,
formularios, grids, botones y media se apilan o reducen escala; las tablas
anchas conservan scroll dentro de su propio contenedor para evitar overflow de
la página.

## Verificación

La suite `tests/navigation-shell.test.tsx` cubre la estructura del shell,
opciones por rol, rutas activas, rail colapsado y drawer móvil. La validación
completa incluye Vitest con cobertura, ESLint, TypeScript, build de Next.js y
`git diff --check`.
