# Gestión de cuentas desde el frontend

La ruta `/admin/users` es exclusiva de administradores. El servidor valida el
rol antes de renderizarla con `requireAdmin`; el backend vuelve a comprobarlo
en cada petición, por lo que ocultar el enlace no se considera una medida de
seguridad.

## Flujo para nuevos registros

1. El usuario crea una cuenta y confirma su email mediante enlace o código.
2. La cuenta permanece en estado `pending`.
3. Un administrador la aprueba o rechaza desde el directorio de usuarios.
4. Solo una cuenta `active` y verificada puede iniciar sesión. Si la contraseña
   es correcta pero el email no está verificado, el login genera otro código y
   envía al formulario de confirmación.

El formulario limpia caracteres no numéricos del código y limita la entrada a
seis dígitos. Al enviar, recorta espacios del email y del código para mantener
el contrato con el backend; los códigos siguen siendo validados, persistidos
como hash y consumidos exclusivamente por el backend.

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

## Perfil académico del estudiante

El registro público solicita el año de inicio, un grupo y una sede finales. No
se registran recorridos ni grupos anteriores. LinkedIn y GitHub son opcionales;
los enlaces deben ser URLs HTTP(S) de sus dominios correspondientes.

La edición del perfil usa `PUT /auth/me/academic-profile`. Los administradores
pueden consultar y corregir el perfil de un estudiante desde el directorio de
usuarios mediante `PUT /admin/students/{student_id}/academic-profile`. Los
trainers y administradores no completan este bloque, y el BFF existente
continúa reenviando cookies, cuerpo y parámetros sin un contrato adicional.
