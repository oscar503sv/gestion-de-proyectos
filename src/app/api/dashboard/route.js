import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";

// Función para obtener estadísticas del dashboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedBy = parseInt(searchParams.get('requestedBy'));
    
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

    // Función auxiliar para calcular días hasta vencimiento
    const getDaysUntilDue = (dueDate) => {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // Estadísticas base para cualquier usuario
    let dashboardData = {};

    if (requestingUser.role === 'usuario') {
      // Estadísticas para usuarios regulares
      const userTasks = data.tasks.filter(task => task.assignedTo === requestedBy);
      const userProjectIds = [...new Set(userTasks.map(task => task.projectId))];
      const userProjects = data.projects.filter(project => userProjectIds.includes(project.id));

      // Estadísticas de tareas del usuario
      const pendingTasks = userTasks.filter(task => task.status === 'pendiente');
      const inProgressTasks = userTasks.filter(task => task.status === 'en progreso');
      const completedTasks = userTasks.filter(task => task.status === 'completado');
      
      // Tareas vencidas y por vencer
      const today = new Date();
      const overdueTasks = userTasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== 'completado';
      });
      
      const dueSoonTasks = userTasks.filter(task => {
        const daysUntilDue = getDaysUntilDue(task.dueDate);
        return daysUntilDue >= 0 && daysUntilDue <= 7 && task.status !== 'completado';
      });

      dashboardData = {
        userInfo: {
          id: requestingUser.id,
          name: requestingUser.name,
          role: requestingUser.role
        },
        myTasks: {
          total: userTasks.length,
          pending: pendingTasks.length,
          inProgress: inProgressTasks.length,
          completed: completedTasks.length,
          overdue: overdueTasks.length,
          dueSoon: dueSoonTasks.length
        },
        myProjects: {
          total: userProjects.length,
          withTasksAssigned: userProjects.length,
          projectsBreakdown: userProjects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
          }, {})
        },
        upcomingDeadlines: dueSoonTasks.map(task => {
          const project = data.projects.find(p => p.id === task.projectId);
          return {
            taskId: task.id,
            taskTitle: task.title,
            projectName: project ? project.name : 'Proyecto no encontrado',
            dueDate: task.dueDate,
            priority: task.priority,
            daysUntilDue: getDaysUntilDue(task.dueDate)
          };
        }).sort((a, b) => a.daysUntilDue - b.daysUntilDue)
      };

    } else if (requestingUser.role === 'gerente') {
      // Estadísticas para gerentes (vista completa del sistema)
      
      // Estadísticas de proyectos
      const pendingProjects = data.projects.filter(project => project.status === 'pendiente');
      const inProgressProjects = data.projects.filter(project => project.status === 'en progreso');
      const completedProjects = data.projects.filter(project => project.status === 'completado');
      const canceledProjects = data.projects.filter(project => project.status === 'cancelado');

      // Estadísticas de tareas
      const pendingTasks = data.tasks.filter(task => task.status === 'pendiente');
      const inProgressTasks = data.tasks.filter(task => task.status === 'en progreso');
      const completedTasks = data.tasks.filter(task => task.status === 'completado');
      const unassignedTasks = data.tasks.filter(task => 
        !data.users.find(user => user.id === task.assignedTo)
      );

      // Tareas vencidas y por vencer (todas)
      const today = new Date();
      const overdueTasks = data.tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== 'completado';
      });
      
      const dueSoonTasks = data.tasks.filter(task => {
        const daysUntilDue = getDaysUntilDue(task.dueDate);
        return daysUntilDue >= 0 && daysUntilDue <= 7 && task.status !== 'completado';
      });

      // Progreso de proyectos con porcentajes
      const projectsProgress = data.projects.map(project => {
        const projectTasks = data.tasks.filter(task => task.projectId === project.id);
        const completedProjectTasks = projectTasks.filter(task => task.status === 'completado');
        const progressPercentage = projectTasks.length > 0 
          ? Math.round((completedProjectTasks.length / projectTasks.length) * 100)
          : 0;

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          totalTasks: projectTasks.length,
          completedTasks: completedProjectTasks.length,
          progressPercentage: progressPercentage,
          deadline: project.deadline
        };
      }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      dashboardData = {
        userInfo: {
          id: requestingUser.id,
          name: requestingUser.name,
          role: requestingUser.role
        },
        allProjects: {
          total: data.projects.length,
          pending: pendingProjects.length,
          inProgress: inProgressProjects.length,
          completed: completedProjects.length,
          canceled: canceledProjects.length
        },
        allTasks: {
          total: data.tasks.length,
          pending: pendingTasks.length,
          inProgress: inProgressTasks.length,
          completed: completedTasks.length,
          unassigned: unassignedTasks.length,
          overdue: overdueTasks.length,
          dueSoon: dueSoonTasks.length
        },
        projectsProgress: projectsProgress,
        criticalDeadlines: dueSoonTasks.concat(overdueTasks).map(task => {
          const project = data.projects.find(p => p.id === task.projectId);
          const assignedUser = data.users.find(u => u.id === task.assignedTo);
          return {
            taskId: task.id,
            taskTitle: task.title,
            projectName: project ? project.name : 'Proyecto no encontrado',
            assignedTo: assignedUser ? assignedUser.name : 'Sin asignar',
            dueDate: task.dueDate,
            priority: task.priority,
            status: task.status,
            daysUntilDue: getDaysUntilDue(task.dueDate),
            isOverdue: getDaysUntilDue(task.dueDate) < 0
          };
        }).sort((a, b) => a.daysUntilDue - b.daysUntilDue),
        teamOverview: data.users.filter(user => user.role === 'usuario').map(user => {
          const userTasks = data.tasks.filter(task => task.assignedTo === user.id);
          const completedUserTasks = userTasks.filter(task => task.status === 'completado');
          return {
            userId: user.id,
            userName: user.name,
            totalTasks: userTasks.length,
            completedTasks: completedUserTasks.length,
            pendingTasks: userTasks.length - completedUserTasks.length
          };
        })
      };
    } else {
      return NextResponse.json({
        success: false,
        message: "Rol de usuario no válido"
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: "Estadísticas del dashboard obtenidas exitosamente"
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}
