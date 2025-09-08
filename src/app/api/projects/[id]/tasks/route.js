import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";

// Función para obtener tareas de un proyecto específico
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requestedBy = parseInt(searchParams.get('requestedBy'));
    const status = searchParams.get('status'); // Filtro opcional por estado
    const priority = searchParams.get('priority'); // Filtro opcional por prioridad
    const assignedTo = searchParams.get('assignedTo'); // Filtro opcional por usuario asignado
    
    // Validar ID del proyecto
    const projectId = parseInt(id);
    if (isNaN(projectId)) {
      return NextResponse.json({
        success: false,
        message: "ID de proyecto inválido"
      }, { status: 400 });
    }
    
    // Validar que se proporcione el usuario que hace la petición
    if (!requestedBy || isNaN(requestedBy)) {
      return NextResponse.json({
        success: false,
        message: "El ID del usuario que realiza la petición es requerido"
      }, { status: 400 });
    }
    
    // Verificar que el usuario exista
    const requestingUser = data.users.find(user => user.id === requestedBy);
    if (!requestingUser) {
      return NextResponse.json({
        success: false,
        message: "El usuario que realiza la petición no existe"
      }, { status: 404 });
    }
    
    // Verificar que el proyecto exista
    const project = data.projects.find(project => project.id === projectId);
    if (!project) {
      return NextResponse.json({
        success: false,
        message: "Proyecto no encontrado"
      }, { status: 404 });
    }
    
    // Verificar permisos de acceso al proyecto
    if (requestingUser.role === 'usuario') {
      // Los usuarios solo pueden ver tareas de proyectos donde tienen tareas asignadas
      const userHasTasksInProject = data.tasks.some(task => 
        task.projectId === projectId && task.assignedTo === requestedBy
      );
      
      if (!userHasTasksInProject) {
        return NextResponse.json({
          success: false,
          message: "No tienes permisos para ver las tareas de este proyecto"
        }, { status: 403 });
      }
    }
    
    // Obtener tareas del proyecto
    let projectTasks = data.tasks.filter(task => task.projectId === projectId);
    
    // Si es un usuario regular, filtrar solo sus tareas
    if (requestingUser.role === 'usuario') {
      projectTasks = projectTasks.filter(task => task.assignedTo === requestedBy);
    }
    
    // Aplicar filtros opcionales
    if (status) {
      projectTasks = projectTasks.filter(task => task.status === status);
    }
    
    if (priority) {
      projectTasks = projectTasks.filter(task => task.priority === priority);
    }
    
    if (assignedTo) {
      const assignedToId = parseInt(assignedTo);
      if (!isNaN(assignedToId)) {
        projectTasks = projectTasks.filter(task => task.assignedTo === assignedToId);
      }
    }
    
    // Enriquecer tareas con información adicional
    const tasksWithDetails = projectTasks.map(task => {
      const assignedUser = data.users.find(user => user.id === task.assignedTo);
      
      // Calcular días hasta vencimiento
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        ...task,
        assignedToUser: assignedUser ? { 
          id: assignedUser.id, 
          name: assignedUser.name, 
          email: assignedUser.email 
        } : null,
        daysUntilDue: daysUntilDue,
        isOverdue: daysUntilDue < 0 && task.status !== 'completado',
        isDueSoon: daysUntilDue >= 0 && daysUntilDue <= 7 && task.status !== 'completado'
      };
    });
    
    // Información del proyecto
    const projectCreator = data.users.find(user => user.id === project.createdBy);
    const projectInfo = {
      ...project,
      createdByUser: projectCreator ? {
        id: projectCreator.id,
        name: projectCreator.name,
        email: projectCreator.email
      } : null
    };
    
    // Estadísticas de las tareas del proyecto
    const taskStats = {
      total: projectTasks.length,
      pending: projectTasks.filter(task => task.status === 'pendiente').length,
      inProgress: projectTasks.filter(task => task.status === 'en progreso').length,
      completed: projectTasks.filter(task => task.status === 'completado').length,
      overdue: tasksWithDetails.filter(task => task.isOverdue).length,
      dueSoon: tasksWithDetails.filter(task => task.isDueSoon).length,
      progressPercentage: projectTasks.length > 0 
        ? Math.round((projectTasks.filter(task => task.status === 'completado').length / projectTasks.length) * 100)
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        project: projectInfo,
        tasks: tasksWithDetails,
        statistics: taskStats,
        filters: {
          status: status || null,
          priority: priority || null,
          assignedTo: assignedTo ? parseInt(assignedTo) : null
        }
      },
      message: "Tareas del proyecto obtenidas exitosamente"
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener tareas del proyecto:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}
