# Analítica visual de aprendizaje

La analítica visual se integra en las rutas existentes `/dashboard`, `/admin/analytics` y `/admin/analytics/students/:id`. No existe una ruta nueva ni se modifican los contratos de autenticación o del BFF.

## Períodos

El selector conserva `period` en la URL y admite `7d`, `30d`, `90d` y `all`. Si el valor no es válido, la página usa `30d`. Las páginas siguen siendo Server Components y cargan los datos con `searchParams`; el chart es un Client Component aislado.

## Datos

El backend agrega eventos reales: lecciones y módulos completados e intentos enviados. El snapshot representa el avance actual. Las series contienen fechas UTC en formato `YYYY-MM-DD` y respetan el período solicitado:

- `progress_series`: porcentaje acumulado de avance.
- `score_series`: promedio diario de calificaciones.
- `activity_series`: conteos diarios de lecciones, módulos e intentos.

La vista de admin y trainer conserva el alcance definido por FastAPI. El trainer nunca recibe estudiantes fuera de sus asignaciones.

## Componentes

`components/analytics/analytics-chart.tsx` encapsula Lightweight Charts v5.2, configura `autoSize`, un canvas oscuro en Deep Twilight, colores Campuslands, crosshair dorado y limpieza con `chart.remove()`. Como el canvas no es suficiente para accesibilidad, cada gráfico también expone una tabla desplegable con los mismos datos.

`analytics-chart-card.tsx` compone título, descripción, leyenda y gráfico. `analytics-period-selector.tsx` mantiene el período navegable y usable con teclado.

Los gráficos son:

- `AreaSeries` para avance acumulado.
- `LineSeries` para calificaciones.
- `HistogramSeries` para actividad.

Los estados sin datos explican que todavía no existen eventos en el rango seleccionado; no se generan datos ficticios. Si el endpoint de resumen falla, la interfaz muestra un error en lugar de reemplazar la respuesta con ceros.
