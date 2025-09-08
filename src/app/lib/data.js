// Datos simulados para la aplicación de gestión de proyectos
let data = {
  users: [
    { id: 1, name: "Juan Pérez", email: "juan@proyecto.com", password: "password123", role: "gerente" },
    { id: 2, name: "María García", email: "maria@proyecto.com", password: "password123", role: "usuario" },
    { id: 3, name: "Luis Torres", email: "luis@proyecto.com", password: "password123", role: "usuario" },
    { id: 4, name: "Ana López", email: "ana@proyecto.com", password: "password123", role: "usuario" },
    { id: 5, name: "Carla Ramos", email: "carla@proyecto.com", password: "password123", role: "gerente" }
  ],
  projects: [
    {
      id: 1,
      name: "Desarrollo de Sitio Web",
      description: "Creación de un sitio web corporativo responsive",
      status: "en progreso",
      deadline: "2025-12-15",
      createdBy: 1,
      createdAt: "2025-09-08T10:00:00Z"
    },
    {
      id: 2,
      name: "App Móvil",
      description: "Desarrollo de aplicación móvil para iOS y Android",
      status: "pendiente",
      deadline: "2026-02-20",
      createdBy: 1,
      createdAt: "2025-09-15T14:30:00Z"
    },
    {
      id: 3,
      name: "Sistema de Inventario",
      description: "Implementación de sistema para gestión de stock en bodegas",
      status: "completado",
      deadline: "2025-10-30",
      createdBy: 5,
      createdAt: "2025-09-12T09:15:00Z"
    },
    {
      id: 4,
      name: "Migración a la nube",
      description: "Mover la infraestructura a un proveedor cloud",
      status: "en progreso",
      deadline: "2026-03-15",
      createdBy: 5,
      createdAt: "2025-09-20T11:45:00Z"
    }
  ],
  tasks: [
    {
      id: 1,
      title: "Diseñar interfaz",
      description: "Crear diseños de alta fidelidad en Figma",
      status: "completado",
      priority: "alta",
      projectId: 1,
      assignedTo: 2,
      createdAt: "2025-09-09T09:00:00Z",
      dueDate: "2025-09-16T17:00:00Z"
    },
    {
      id: 2,
      title: "Implementar frontend",
      description: "Desarrollar componentes React para la interfaz",
      status: "en progreso",
      priority: "alta",
      projectId: 1,
      assignedTo: 2,
      createdAt: "2025-09-12T14:00:00Z",
      dueDate: "2025-10-05T17:00:00Z"
    },
    {
      id: 3,
      title: "Configurar backend",
      description: "Montar API con autenticación y base de datos",
      status: "pendiente",
      priority: "media",
      projectId: 1,
      assignedTo: 3,
      createdAt: "2025-09-13T10:00:00Z",
      dueDate: "2025-10-10T17:00:00Z"
    },
    {
      id: 4,
      title: "Diseñar base de datos",
      description: "Modelo entidad-relación para productos y movimientos",
      status: "completado",
      priority: "alta",
      projectId: 3,
      assignedTo: 4,
      createdAt: "2025-09-14T08:30:00Z",
      dueDate: "2025-09-25T17:00:00Z"
    },
    {
      id: 5,
      title: "Pruebas unitarias",
      description: "Crear tests para los módulos críticos",
      status: "en progreso",
      priority: "media",
      projectId: 2,
      assignedTo: 3,
      createdAt: "2025-09-16T13:00:00Z",
      dueDate: "2025-11-10T17:00:00Z"
    },
    {
      id: 6,
      title: "Configurar pipeline CI/CD",
      description: "Automatizar despliegues a entorno de staging",
      status: "pendiente",
      priority: "alta",
      projectId: 4,
      assignedTo: 4,
      createdAt: "2025-09-18T09:00:00Z",
      dueDate: "2025-11-01T17:00:00Z"
    }
  ]
};

// Exportar los datos para ser usados en otros módulos
export default data;
