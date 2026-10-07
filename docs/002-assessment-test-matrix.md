# Evaluaciones y trainers: matriz de pruebas frontend

## Objetivo

La interfaz debe conservar los contratos del backend sin exponer respuestas correctas al estudiante. Esta suite cubre el flujo de quiz, el workspace editorial, la configuración, trainers, analítica y el BFF sin llamadas de red externas.

## Matriz de contratos

| Superficie | Cobertura |
| --- | --- |
| `server-api` | cookies, `no-store`, fallbacks, rutas de sesión, `requireEducator` y `requireAdmin` |
| BFF | método, query string, headers, cookie, body y handlers HTTP |
| `QuizPanel` | estados vacío, bloqueado, aprobado, sin intentos, carga, selección, envío, resultado, refuerzo y errores |
| `AssessmentEditor` | preparación, sugerencias, revisión humana, edición completa, aprobación, publicación mínima y errores |
| Configuración | umbral 1–100, quiz 3–5, tres intentos no editables, éxito, carga y errores |
| Trainers | invitación, promoción, asignación, selección vacía, URL y errores |
| Analítica y navegación | alcance por rol, falencias, historial, controles admin y restricciones de educador |

Las pruebas DOM usan Testing Library, `user-event`, `jsdom` y dobles de `apiFetch`. El BFF se prueba con `NextRequest` y un `fetch` falso; no se requiere levantar FastAPI.

## Comandos

```bash
pnpm test
pnpm test:coverage
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

`pnpm test:coverage` exige 95 % mínimo global en statements, branches, functions y lines sobre la superficie de APIs, BFF, navegación, quizzes y workspace editorial. La cobertura actual del conjunto incluido es 100 % de líneas/statements/functions y 95.65 % de ramas.

## Límites deliberados

- No se usan MongoDB, DeepSeek, cookies reales ni usuarios de producción.
- La prueba del BFF valida la solicitud que se construiría y la respuesta delegada; la conectividad real se valida en el entorno integrado.
- La revisión visual de rutas autenticadas requiere navegador y sesión, por lo que queda fuera de Vitest.
