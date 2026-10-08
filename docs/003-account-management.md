# Gestión de cuentas desde el frontend

La ruta `/admin/users` es exclusiva de administradores. El servidor valida el
rol antes de renderizarla con `requireAdmin`; el backend vuelve a comprobarlo
en cada petición, por lo que ocultar el enlace no se considera una medida de
seguridad.

## Flujo para nuevos registros

1. El usuario crea una cuenta y confirma su email.
2. La cuenta permanece en estado `pending`.
3. Un administrador la aprueba o rechaza desde el directorio de usuarios.
4. Solo una cuenta `active` y verificada puede iniciar sesión.

## Estados visibles

| Estado | Significado | Acción disponible |
| --- | --- | --- |
| Pendiente | Espera revisión administrativa | Aprobar o rechazar |
| Activa | Puede acceder si verificó el email | Inactivar |
| Rechazada | No fue aprobada, pero se conserva | Reabrir |
| Inactiva | Acceso pausado o bloqueado | Reactivar |

La tabla muestra nombre, email, rol, estado, verificación y fecha de registro.
Los filtros se aplican por texto, rol y estado. Las acciones actualizan la fila
sin abandonar el contexto del directorio y muestran el error devuelto por la
API cuando una transición deja de ser válida.
