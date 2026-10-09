# Asistente IA para módulos y lecciones

## Alcance

El CMS ofrece a administradores y trainers un asistente para proponer objetivos,
mapas conceptuales, formatos, guías de sesión, orden de lecciones y bloques de
contenido Tiptap. La propuesta se revisa dentro de `ModuleForm`, la vista de
organización de un módulo y `LessonEditor`.

El frontend no llama a DeepSeek ni contiene una clave de IA. Todas las llamadas
van al Route Handler BFF `/api/backend/[...path]`, que conserva la sesión y
reenvía el contrato de FastAPI. La generación de un módulo solo produce un
blueprint: no crea automáticamente documentos de lección.

## Flujo editorial

1. El usuario introduce un tema y solicita una propuesta.
2. El asistente muestra objetivos, estructura, formatos, guía, secuencia y/o
   bloques Tiptap disponibles.
3. El usuario selecciona las secciones que desea aplicar y confirma.
4. El backend valida `base_updated_at` antes de guardar.
5. En borradores se actualizan solo las secciones seleccionadas. En contenido
   publicado se muestra una revisión pendiente; el contenido público no cambia.
6. El usuario puede publicar explícitamente la revisión o descartarla.

Las respuestas de generación, aplicación, conflicto y publicación se muestran
en un toast global en la parte superior central. Los errores HTTP se mapean a
mensajes orientados a la acción para distinguir sesión, permisos, conflictos y
fallos del proveedor. Los estados de progreso continuo, como una carga de
media, permanecen junto al control que los inició.

La organización existente presenta la propuesta antes de reordenar. Si el
contenido cambió desde la generación, se muestra un conflicto y se debe
regenerar para evitar perder trabajo manual.

## Contrato y tipos

Los tipos compartidos de `lib/types.ts` representan `InstructionalPlan`, nodos
del mapa, formatos, segmentos de sesión, blueprints y revisiones. Las funciones
de `lib/api.ts` cubren generación, aplicación, publicación y descarte. Las
funciones server-only de `lib/server-api.ts` sirven para cargar una revisión
pendiente sin exponer credenciales.

Las secciones aplicables son independientes: objetivos, mapa/guía, formatos,
orden, campos de la lección y bloques Tiptap. Los bloques mostrados por el
asistente corresponden al subconjunto seguro validado por FastAPI; los medios
se siguen gestionando mediante el flujo multimedia existente.

## Experiencia del estudiante

Las pantallas públicas de módulo y lección muestran los objetivos y un resumen
del plan instruccional aprobado. Una revisión pendiente no es visible para el
estudiante hasta la publicación explícita.

## Variables y privacidad

No se añade ninguna variable `NEXT_PUBLIC_` ni una clave de IA al frontend.
`BACKEND_URL` continúa siendo la única URL server-side necesaria para el BFF.
La privacidad y la configuración de proveedor pertenecen al backend; consulta
[`softstack-backend/prds/010-ai-content-authoring-and-organization.md`](../../softstack-backend/prds/010-ai-content-authoring-and-organization.md)
para el contrato completo.

## Verificación

Las pruebas de frontend cubren generación, selección parcial, errores del
proveedor, rutas API, estados de revisión y resumen estudiantil. El typecheck,
lint y build no sustituyen una prueba visual autenticada contra FastAPI,
MongoDB y DeepSeek reales.
