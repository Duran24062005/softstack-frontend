# SoftStack Frontend

Frontend Next.js de la plataforma educativa SoftStack.

## Desarrollo

Instala dependencias y define la URL del backend:

```bash
pnpm install
echo 'BACKEND_URL=http://localhost:8000' > .env.local
pnpm dev
```

El proxy BFF de `app/api/backend/[...path]/route.ts` mantiene las cookies de sesión en el dominio del frontend y reenvía las solicitudes a FastAPI.

## Rutas principales

- `/` — landing pública.
- `/login` y `/register` — autenticación y creación de cuenta.
- `/verify-email` — confirmación de la cuenta mediante enlace.
- `/forgot-password` y `/reset-password` — solicitud y aplicación del código de recuperación.
- `/dashboard` — ruta de aprendizaje y progreso.
- `/dashboard/profile` — edición de perfil.
- `/dashboard/modules/:id` y `/dashboard/lessons/:id` — consumo de contenido.
- `/admin/modules`, `/admin/modules/new` y `/admin/modules/:id` — catálogo, creación de módulos y listado de lecciones del módulo.
- `/admin/lessons/new` — editor Tiptap para administradores.

La interfaz usa Tailwind v4, `motion/react` para animaciones accesibles y Tiptap para documentos estructurados.

Los módulos se crean desde `/admin/modules/new` con título, descripción, orden y estado (`draft`, `published` o `archived`). Al guardarlos, la interfaz vuelve al catálogo. Al crear o editar una lección, vuelve automáticamente al módulo donde pertenece. El editor usa controles contextuales al lado del bloque activo, además de una barra flotante para formato inline cuando se selecciona texto.
