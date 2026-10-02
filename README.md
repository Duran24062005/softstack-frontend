# SoftStack Frontend

Frontend Next.js de la plataforma educativa SoftStack.

## Desarrollo

Instala dependencias y define la URL del backend:

```bash
pnpm install
echo 'BACKEND_URL=http://localhost:8000' > .env.local
pnpm dev
```

Las pruebas unitarias del flujo multimedia se ejecutan con:

```bash
pnpm test
```

La instalación permite el script de build de `esbuild`, requerido por las
herramientas de compilación del frontend. Los scripts de `sharp` y
`unrs-resolver` permanecen bloqueados porque no son necesarios para este
proyecto; esta política se define en `pnpm-workspace.yaml` y también se aplica
en los builds de Vercel.

Vitest cubre validación de MIME y tamaño, carga directa con progreso, importación de URLs y recorrido recursivo de nodos Tiptap.

El proxy BFF de `app/api/backend/[...path]/route.ts` mantiene las cookies de sesión en el dominio del frontend y reenvía las solicitudes a FastAPI.

## Rutas principales

- `/` — landing pública.
- `/login` y `/register` — autenticación y creación de cuenta.
- `/verify-email` — confirmación de la cuenta mediante enlace.
- `/forgot-password` y `/reset-password` — solicitud y aplicación del código de recuperación.
- `/dashboard` — ruta de aprendizaje y progreso.
- `/dashboard/profile` — edición de perfil y gestión de foto privada.
- `/dashboard/modules/:id` y `/dashboard/lessons/:id` — consumo de contenido.
- `/admin/modules`, `/admin/modules/new` y `/admin/modules/:id` — catálogo, creación de módulos y listado de lecciones del módulo.
- `/admin/lessons/new` — editor Tiptap para administradores.

La interfaz usa Tailwind v4, `motion/react` para animaciones accesibles y Tiptap para documentos estructurados.

El editor de lecciones permite cargar imágenes y videos directamente a un Blob Store público mediante `/api/content-media/upload`. Las URLs y metadatos se guardan en el documento MongoDB; las URLs pegadas se importan al mismo store antes de insertarse. Los módulos admiten una portada multimedia opcional. Configura `CONTENT_BLOB_READ_WRITE_TOKEN` únicamente en el entorno server-side de Next.js y del backend; nunca uses `NEXT_PUBLIC_` para este secreto.

La foto de perfil se carga mediante `multipart/form-data` al BFF y el backend la almacena en Vercel Blob privado. El navegador nunca recibe el token de Blob; la imagen se sirve desde `/api/backend/auth/me/profile-photo` con la sesión autenticada.

Los módulos se crean desde `/admin/modules/new` con título, descripción, orden y estado (`draft`, `published` o `archived`). Al guardarlos, la interfaz vuelve al catálogo. Al crear o editar una lección, vuelve automáticamente al módulo donde pertenece. El editor usa controles contextuales al lado del bloque activo, además de una barra flotante para formato inline cuando se selecciona texto.
