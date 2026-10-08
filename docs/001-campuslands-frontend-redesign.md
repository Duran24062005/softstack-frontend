# Rediseño Campuslands × SoftStack

## Problema y objetivo

La experiencia anterior tenía estilos y patrones visuales dispersos entre la
landing, autenticación, aprendizaje y CMS. El objetivo de este cambio es
entregar una identidad unificada, reconocible y accesible para las rutas
existentes, sin modificar contratos de negocio, rutas, datos ni permisos.

## Alcance implementado

- Sistema visual Campuslands con `#00AA80`, `#16697A`, `#0F084B`, blanco,
  `#F4B422` y negro; fondos blancos como regla y Twilight para momentos de
  énfasis.
- Lockup Campuslands × SoftStack con los logos oficiales en PNG, navegación de
  aplicación lateral derecha colapsable en escritorio y drawer móvil, firma
  SVG de trayectoria y componentes de estado reutilizables.
- Landing, autenticación, dashboard, módulos, lecciones, perfil, biblioteca
  administrativa, detalle de módulo y editor de lecciones.
- Estados globales de carga, error y 404.
- Reemplazo de los prompts del navegador por `UrlDialog`, que valida HTTP(S),
  usa foco contenido, permite Escape y restaura el foco que inició la acción.

## Actores y permisos

Las rutas públicas continúan públicas. El dashboard requiere una sesión y las
rutas bajo `/admin` protegidas por `requireEducator` permiten contenido a
`admin` y `trainer`; configuración, trainers, asignaciones y reinicios siguen
siendo exclusivos de `admin`. La navegación refleja esa separación, pero no
reemplaza la autorización del servidor.

## Contratos que se mantienen

- Rutas, BFF, APIs FastAPI, sesión HttpOnly y redirecciones posteriores a
  guardar contenido.
- Progreso de lecciones y la persistencia real de módulos, lecciones y
  documentos Tiptap.
- Blob público para media educativa, Blob privado para foto de perfil y la
  separación de sus permisos.
- Poppins local ya integrada, sus tokens `--font-brand-body` y
  `--font-brand-display`, y la posibilidad de sustituir solo display por Sugo
  Classic en el futuro.

## Decisiones de implementación

Los elementos compartidos se concentran en `components/ui` y
`components/navigation`. Los shells de dashboard y administración usan un
límite `Suspense` para la navegación cliente que consume la ruta actual. En
escritorio, la navegación vive en un sidebar fijo a la derecha cuyo ancho se
reduce a modo iconos; en móvil conserva una barra superior que abre un drawer
desde la derecha con overlay, cierre por Escape y bloqueo temporal del scroll.
Las páginas mantienen el fetch de servidor y los componentes cliente se
limitan a interacción, formularios, editor y diálogos.

El layout responsive usa `lg` como punto de cambio para el sidebar permanente.
Debajo de `1024px`, el contenido ocupa todo el ancho y la navegación se abre
como panel superpuesto. Las tablas largas usan scroll interno y los encabezados,
formularios, grids y botones reducen su escala o apilan sus columnas en móvil.

La trayectoria es SVG y recibe el progreso existente; no crea ni modifica
datos. Las animaciones respetan `prefers-reduced-motion`.

## Uso de los logos oficiales

`components/ui/campuslands-logo.tsx` centraliza la selección de assets para que
las superficies claras y oscuras mantengan contraste y proporción:

- `Campuslands_with_background_white.png`: logo a color para fondos claros.
- `campuslands_logo_without_backgorund.png`: logo blanco transparente para el
  panel oscuro de autenticación y otros fondos Twilight.

Las variantes JPEG permanecen disponibles como recursos de marca, pero no se
usan en el lockup principal porque tienen menor flexibilidad de composición o
resolución para navegación y estados compartidos. El nombre `backgorund` del
PNG blanco se conserva para no romper el asset entregado.

## Validaciones y riesgos

Se añadieron pruebas unitarias para reglas de navegación y validación de URLs,
además de las pruebas de media existentes. Deben ejecutarse `pnpm test`,
`pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` y `git diff --check` antes
de desplegar.

La revisión visual requiere una sesión válida y un navegador disponible para
comprobar las rutas autenticadas en móvil y escritorio. No se deben usar datos
de producción en pruebas de escritura sin autorización explícita.
