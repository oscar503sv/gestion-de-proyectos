// Datos simulados para la aplicación de gestión de proyectos
// Estructura: usuarios, proyectos, tareas
let data = {
  users: [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@proyecto.com",
      password: "password123",
      role: "gerente"
    },
    {
      id: 2,
      name: "María García",
      email: "maria@proyecto.com",
      password: "password123",
      role: "usuario"
    }
  ],
  projects: [
    {
      id: 1,
      name: "Desarrollo de Sitio Web",
      description: "Creación de un sitio web corporativo responsive",
      status: "en progreso",
      deadline: "2023-12-15",
      createdBy: 1,
      createdAt: "2023-10-10T10:00:00Z"
    },
    {
      id: 2,
      name: "App Móvil",
      description: "Desarrollo de aplicación móvil para iOS y Android",
      status: "pendiente",
      deadline: "2024-02-20",
      createdBy: 1,
      createdAt: "2023-11-05T14:30:00Z"
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
      createdAt: "2023-10-11T09:00:00Z",
      dueDate: "2023-10-18T17:00:00Z"
    },
    {
      id: 2,
      title: "Implementar frontend",
      description: "Desarrollar componentes React para la interfaz",
      status: "en progreso",
      priority: "alta",
      projectId: 1,
      assignedTo: 2,
      createdAt: "2023-10-15T14:00:00Z",
      dueDate: "2023-11-05T17:00:00Z"
    }
  ]
};

// Exportar los datos para su uso en la aplicación con Route Handlers
export default data;
