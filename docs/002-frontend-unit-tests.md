# Tests unitarios del frontend

## Objetivo

Mantener verificadas las reglas deterministas del frontend sin requerir un
navegador, una sesión autenticada, MongoDB, Blob Storage ni el backend activo.

## Herramienta y alcance

La suite usa Vitest con entorno `node` y alias `@/` alineado con TypeScript.
Las pruebas cubren:

- `lib/api.ts`: prefijo del BFF, cookies, headers para JSON y `FormData`,
  errores del backend y respuestas `204`.
- `lib/server-api.ts`: propagación de cookies, `no-store`, redirecciones por
  sesión/rol, composición de progreso y fallbacks para respuestas fallidas.
- `lib/content-media.ts`: tipos, límites, carga, importación, eliminación y
  recorrido de referencias en documentos Tiptap.
- `lib/ui-validation.ts` y `components/navigation/navigation-items.ts`:
  validación de URLs y reglas de navegación por rol/ruta.

No se consideran pruebas unitarias las comprobaciones de renderizado visual o
las pruebas end-to-end. Esas validaciones requieren un entorno de navegador y
una sesión de prueba separada.

## Ejecución

Desde `softstack-frontend`:

```bash
pnpm test
```

La configuración incluye `tests/**/*.test.{ts,tsx}` para permitir pruebas TypeScript
y TSX. En entornos donde el store global de pnpm no sea escribible, se puede
validar la suite sin reinstalar dependencias con:

```bash
./node_modules/.bin/vitest run
```
