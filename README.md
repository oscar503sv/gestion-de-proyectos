Aplicación web moderna para la gestión de proyectos construida con Next.js, React y Tailwind.

## Para ejecutar este proyecto

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### Prerrequisitos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 18.0 o superior)
- [npm](https://www.npmjs.com/) (se instala automáticamente con Node.js)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/oscar503sv/gestion-de-proyectos.git
   cd gestion-de-proyectos
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

### Ejecución en Desarrollo

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## API Endpoints

La aplicación incluye una API REST completa para la gestión de usuarios, proyectos y tareas. Todos los endpoints devuelven respuestas en formato JSON con la estructura:

```json
{
  "success": true/false,
  "data": { /* datos de respuesta */ },
  "message": "Mensaje descriptivo",
  "errors": ["error1", "error2"] // Solo en caso de errores de validación
}
```

### 🔐 Autenticación

#### POST `/api/auth/login`
Autenticación de usuarios para acceso al sistema.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Validaciones:**
- `email`: Debe ser un formato de email válido
- `password`: Es requerido (no vacío)

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Nombre Usuario",
      "email": "usuario@ejemplo.com",
      "role": "gerente"
    },
    "sessionToken": "session_1_1725532800000"
  },
  "message": "Autenticación exitosa"
}
```

**🧪 Credenciales de prueba:**
```json
// Gerente
{
  "email": "juan@proyecto.com",
  "password": "password123"
}

// Usuario regular  
{
  "email": "maria@proyecto.com", 
  "password": "password123"
}

```

### 👥 Usuarios

#### GET `/api/users`
Obtiene todos los usuarios del sistema (sin contraseñas).

#### POST `/api/users`
Crea un nuevo usuario.

**Body:**
```json
{
  "name": "Nombre Completo",
  "email": "email@ejemplo.com",
  "password": "contraseña123",
  "role": "gerente" // o "usuario"
}
```

#### GET `/api/users/[id]`
Obtiene un usuario específico por ID.

#### PUT `/api/users/[id]`
Actualiza un usuario existente.

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "password": "nuevaContraseña"
}
```

#### DELETE `/api/users/[id]`
Elimina un usuario (no se puede eliminar si tiene proyectos o tareas asignadas).

### 📁 Proyectos

#### GET `/api/projects?requestedBy=USER_ID`
Obtiene proyectos según el rol del usuario que hace la petición.

**Parámetro obligatorio:**
- `requestedBy`: ID del usuario que realiza la petición

**Lógica de permisos:**
- **Gerentes**: Pueden ver TODOS los proyectos del sistema
- **Usuarios**: Solo pueden ver proyectos donde tienen tareas asignadas

**Respuesta:** Proyectos con información del usuario creador incluida.

#### POST `/api/projects`
Crea un nuevo proyecto.

**🔒 Restricción:** Solo usuarios con rol 'gerente' pueden crear proyectos.

**Body:**
```json
{
  "name": "Nombre del Proyecto",
  "description": "Descripción detallada del proyecto",  
  "deadline": "2025-12-31",
  "status": "pendiente",
  "createdBy": 1 // ID del gerente que crea el proyecto
}
```

**Validaciones:**
- `name`: 3-100 caracteres, debe ser único
- `description`: 10-500 caracteres
- `deadline`: No puede ser anterior a hoy
- `createdBy`: Debe ser un usuario existente con rol 'gerente'

#### GET `/api/projects/[id]`
Obtiene un proyecto específico por ID.

#### PUT `/api/projects/[id]`
Actualiza un proyecto (solo gerentes).

**Body:**
```json
{
  "name": "Nuevo nombre",
  "description": "Nueva descripción",
  "status": "en progreso",
  "deadline": "2025-12-31",
  "requestedBy": 1 // ID del gerente que hace la petición
}
```

#### DELETE `/api/projects/[id]`
Elimina un proyecto (solo gerentes). Se puede eliminar si:
- No tiene tareas asociadas, O
- Está completado y todas sus tareas están completadas

**Body:**
```json
{
  "requestedBy": 1 // ID del gerente
}
```

### 📋 Tareas

#### GET `/api/tasks?requestedBy=USER_ID`
Obtiene tareas según el rol del usuario que hace la petición.

**Parámetro obligatorio:**
- `requestedBy`: ID del usuario que realiza la petición

**Lógica de permisos:**
- **Gerentes**: Pueden ver TODAS las tareas del sistema
- **Usuarios**: Solo pueden ver tareas asignadas a ellos

**Respuesta:** Tareas con información del usuario asignado y proyecto incluida.

#### POST `/api/tasks`
Crea una nueva tarea.

**🔒 Restricción:** Solo usuarios con rol 'gerente' pueden crear tareas.

**Body:**
```json
{
  "title": "Título de la tarea",
  "description": "Descripción detallada",
  "projectId": 1,
  "assignedTo": 2, // ID del usuario asignado
  "priority": "alta", // "baja", "media", "alta"
  "status": "pendiente", // opcional: "pendiente", "en progreso", "completado"
  "dueDate": "2025-10-15T17:00:00Z",
  "requestedBy": 1 // ID del gerente que crea la tarea
}
```

**Validaciones:**
- `title`: 3-100 caracteres
- `description`: 10-500 caracteres
- `projectId`: Debe ser un proyecto existente
- `assignedTo`: Debe ser un usuario existente
- `dueDate`: No puede ser anterior a hoy
- `requestedBy`: Debe ser un gerente existente

#### GET `/api/tasks/[id]?requestedBy=USER_ID`
Obtiene una tarea específica por ID (usuarios solo pueden ver sus tareas asignadas).

#### PUT `/api/tasks/[id]`
Actualiza una tarea:
- **Gerentes**: Pueden actualizar cualquier campo de cualquier tarea
- **Usuarios**: Solo pueden actualizar el `status` de sus tareas asignadas

**Body para gerentes:**
```json
{
  "title": "Nuevo título",
  "description": "Nueva descripción",
  "status": "en progreso",
  "priority": "media",
  "dueDate": "2025-11-01T17:00:00Z",
  "requestedBy": 1
}
```

**Body para usuarios:**
```json
{
  "status": "completado",
  "requestedBy": 2 // Solo puede actualizar sus propias tareas
}
```

#### DELETE `/api/tasks/[id]`
Elimina una tarea (solo gerentes).

**Body:**
```json
{
  "requestedBy": 1 // ID del gerente
}
```

### Dashboard y Estadísticas

#### GET `/api/dashboard?requestedBy=USER_ID`
Obtiene estadísticas y datos del dashboard según el rol del usuario.

**Para usuarios regulares:**
```json
{
  "success": true,
  "data": {
    "userInfo": {
      "id": 2,
      "name": "María García",
      "role": "usuario"
    },
    "myTasks": {
      "total": 8,
      "pending": 3,
      "inProgress": 2,
      "completed": 3,
      "overdue": 1,
      "dueSoon": 2
    },
    "myProjects": {
      "total": 3,
      "withTasksAssigned": 3,
      "projectsBreakdown": {
        "en progreso": 2,
        "completado": 1
      }
    },
    "upcomingDeadlines": [
      {
        "taskId": 5,
        "taskTitle": "Revisar documentación",
        "projectName": "Proyecto Web",
        "dueDate": "2025-09-10T17:00:00Z",
        "priority": "alta",
        "daysUntilDue": 5
      }
    ]
  }
}
```

**Para gerentes:**
```json
{
  "success": true,
  "data": {
    "userInfo": {
      "id": 1,
      "name": "Juan Pérez",
      "role": "gerente"
    },
    "allProjects": {
      "total": 5,
      "pending": 1,
      "inProgress": 2,
      "completed": 2,
      "canceled": 0
    },
    "allTasks": {
      "total": 25,
      "pending": 8,
      "inProgress": 10,
      "completed": 7,
      "unassigned": 0,
      "overdue": 3,
      "dueSoon": 5
    },
    "projectsProgress": [
      {
        "id": 1,
        "name": "Desarrollo Web",
        "status": "en progreso",
        "totalTasks": 8,
        "completedTasks": 6,
        "progressPercentage": 75,
        "deadline": "2025-12-15"
      }
    ],
    "criticalDeadlines": [...],
    "teamOverview": [
      {
        "userId": 2,
        "userName": "María García",
        "totalTasks": 8,
        "completedTasks": 3,
        "pendingTasks": 5
      }
    ]
  }
}
```

#### GET `/api/projects/[id]/tasks?requestedBy=USER_ID&status=STATUS&priority=PRIORITY&assignedTo=USER_ID`
Obtiene las tareas de un proyecto específico con filtros opcionales.

**Parámetros de query opcionales:**
- `status`: Filtrar por estado (`pendiente`, `en progreso`, `completado`)
- `priority`: Filtrar por prioridad (`baja`, `media`, `alta`)
- `assignedTo`: Filtrar por usuario asignado (ID)

**Control de acceso:**
- **Gerentes**: Ven todas las tareas del proyecto
- **Usuarios**: Solo ven sus tareas asignadas del proyecto

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "name": "Desarrollo Web",
      "description": "Proyecto de desarrollo web",
      "status": "en progreso",
      "deadline": "2025-12-15",
      "createdByUser": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "juan@proyecto.com"
      }
    },
    "tasks": [
      {
        "id": 1,
        "title": "Diseñar interfaz",
        "description": "Crear diseños de alta fidelidad",
        "status": "completado",
        "priority": "alta",
        "dueDate": "2025-10-18T17:00:00Z",
        "assignedToUser": {
          "id": 2,
          "name": "María García",
          "email": "maria@proyecto.com"
        },
        "daysUntilDue": -15,
        "isOverdue": false,
        "isDueSoon": false
      }
    ],
    "statistics": {
      "total": 8,
      "pending": 2,
      "inProgress": 3,
      "completed": 3,
      "overdue": 1,
      "dueSoon": 2,
      "progressPercentage": 38
    },
    "filters": {
      "status": null,
      "priority": "alta",
      "assignedTo": null
    }
  }
}
```

### 🔐 Control de Acceso por Roles

#### 👑 Gerente:
- ✅ **Proyectos:** Crear, ver todos, actualizar y eliminar
- ✅ **Tareas:** Crear, ver todas, actualizar cualquier campo, eliminar
- ✅ **Dashboard:** Ver estadísticas globales del sistema

#### 👤 Usuario:
- 🔒 **Proyectos:** Solo ver proyectos donde tiene tareas asignadas
- 🔒 **Tareas:** Solo ver tareas asignadas a él, actualizar solo el `status` de sus tareas
- 🔒 **Dashboard:** Ver solo sus estadísticas personales
- ❌ **Restricciones:** No puede crear/eliminar proyectos ni tareas

#### ⚠️ Parámetro `requestedBy`
**TODOS los endpoints de proyectos y tareas requieren el parámetro `requestedBy`** para aplicar el control de acceso según el rol del usuario.

### Códigos de Estado HTTP

- `200` - Operación exitosa
- `201` - Recurso creado exitosamente
- `400` - Error de validación o formato JSON inválido
- `401` - Credenciales inválidas
- `403` - Sin permisos para realizar la acción
- `404` - Recurso no encontrado
- `409` - Conflicto (ej: email duplicado, proyecto con tareas asociadas)
- `500` - Error interno del servidor

## ⚠️ Notas

### Sobre los Datos
- **Datos simulados:** La aplicación usa datos almacenados en memoria (`/src/app/lib/data.js`)
- **Persistencia:** Los datos NO se persisten entre reinicios del servidor

### Sobre la Autenticación
- **sessionToken:** Se genera de forma simple y se almacena en localStorage

### Sobre los Permisos
- **requestedBy:** Parámetro para el control de acceso en proyectos y tareas
- **Validación:** El sistema valida que el usuario existe y aplica permisos según su rol

## 🛠️ Tecnologías Utilizadas

- **[Next.js](https://nextjs.org/)** - Framework de React para aplicaciones web
- **[React](https://reactjs.org/)** - Biblioteca para interfaces de usuario
- **[Tailwind](https://tailwindcss.com/)** - Framework de CSS utilitario
- **[validator.js](https://github.com/validatorjs/validator.js)** - Validación de datos del lado servidor
