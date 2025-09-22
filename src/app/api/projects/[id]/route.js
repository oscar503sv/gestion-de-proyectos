import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Método GET para obtener un proyecto por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Validar que el ID sea un número válido
    const projectId = parseInt(id);
    if (isNaN(projectId)) {
      return NextResponse.json({
        success: false,
        message: "ID de proyecto inválido"
      }, { status: 400 });
    }
    
    // Buscar el proyecto
    const project = data.projects.find((project) => project.id === projectId);
    
    if (!project) {
      return NextResponse.json({
        success: false,
        message: "Proyecto no encontrado"
      }, { status: 404 });
    }
    
    // Incluir información del usuario creador
    const creator = data.users.find(user => user.id === project.createdBy);
    const projectWithCreator = {
      ...project,
      createdByUser: creator ? { id: creator.id, name: creator.name, email: creator.email } : null
    };
    
    return NextResponse.json({
      success: true,
      data: projectWithCreator,
      message: "Proyecto obtenido exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Método PUT para actualizar un proyecto
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validar ID
    const projectId = parseInt(id);
    if (isNaN(projectId)) {
      return NextResponse.json({
        success: false,
        message: "ID de proyecto inválido"
      }, { status: 400 });
    }
    
    const projectIndex = data.projects.findIndex((project) => project.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Proyecto no encontrado"
      }, { status: 404 });
    }

    // Array para acumular errores de validación
    const errors = [];
    
    // Validar que el usuario que realiza la petición sea un gerente
    if (!body.requestedBy || typeof body.requestedBy !== 'number') {
      errors.push("El ID del usuario que realiza la petición es requerido");
    } else {
      const requestingUser = data.users.find(user => user.id === body.requestedBy);
      if (!requestingUser) {
        errors.push("El usuario que realiza la petición no existe");
      } else if (requestingUser.role !== 'gerente') {
        errors.push("Solo los usuarios con rol de gerente pueden actualizar proyectos");
      }
    }
    
    // Validar nombre del proyecto
    if (body.name !== undefined) {
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        errors.push("El nombre del proyecto es requerido");
      } else if (body.name.trim().length < 3) {
        errors.push("El nombre del proyecto debe tener al menos 3 caracteres");
      } else if (body.name.trim().length > 100) {
        errors.push("El nombre del proyecto no puede exceder 100 caracteres");
      } else {
        // Verificar que no exista otro proyecto con el mismo nombre
        const existingProject = data.projects.find((project, index) => 
          project.name.toLowerCase().trim() === body.name.toLowerCase().trim() && index !== projectIndex
        );
        if (existingProject) {
          errors.push("Ya existe otro proyecto con ese nombre");
        }
      }
    }
    
    // Validar descripción
    if (body.description !== undefined) {
      if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
        errors.push("La descripción del proyecto es requerida");
      } else if (body.description.trim().length < 10) {
        errors.push("La descripción debe tener al menos 10 caracteres");
      } else if (body.description.trim().length > 500) {
        errors.push("La descripción no puede exceder 500 caracteres");
      }
    }
    
    // Validar fecha límite 
    if (body.deadline !== undefined) {
      if (!body.deadline || typeof body.deadline !== 'string') {
        errors.push("La fecha límite es requerida");
      } else if (!validator.isISO8601(body.deadline)) {
        errors.push("La fecha límite debe estar en formato ISO8601 (YYYY-MM-DD)");
      } else {
        const deadlineDate = new Date(body.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
          errors.push("La fecha límite no puede ser anterior a hoy");
        }
      }
    }
    
    // Validar status
    if (body.status !== undefined) {
      const validStatuses = ["pendiente", "en progreso", "completado", "cancelado"];
      if (!validStatuses.includes(body.status)) {
        errors.push(`El estado debe ser uno de: ${validStatuses.join(", ")}`);
      }
    }
    
    // Validar usuario creador - solo gerentes pueden cambiar el creador
    if (body.createdBy !== undefined) {
      if (!body.createdBy || typeof body.createdBy !== 'number') {
        errors.push("El ID del usuario creador debe ser un número");
      } else {
        const userExists = data.users.find(user => user.id === body.createdBy);
        if (!userExists) {
          errors.push("El usuario creador no existe");
        } else if (userExists.role !== 'gerente') {
          errors.push("Solo los usuarios con rol de gerente pueden ser asignados como creadores");
        }
      }
    }

    // Si hay errores de validación, retornarlos
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }

    // Actualizar solo los campos proporcionados (excluyendo requestedBy)
    const updatedProject = { ...data.projects[projectIndex] };
    
    if (body.name !== undefined) updatedProject.name = body.name.trim();
    if (body.description !== undefined) updatedProject.description = body.description.trim();
    if (body.status !== undefined) updatedProject.status = body.status;
    if (body.deadline !== undefined) updatedProject.deadline = body.deadline;
    if (body.createdBy !== undefined) updatedProject.createdBy = body.createdBy;
    
    // Guardar cambios
    data.projects[projectIndex] = updatedProject;
    
    // Obtener información del usuario creador y progreso para la respuesta
    const creator = data.users.find(user => user.id === updatedProject.createdBy);
    
    // Calcular progreso de tareas para este proyecto
    const projectTasks = data.tasks.filter(task => task.projectId === updatedProject.id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'completado').length;
    const teamMembers = [...new Set(projectTasks.map(task => task.assignedTo))];
    
    const projectWithDetails = {
      ...updatedProject,
      createdByUser: creator ? { id: creator.id, name: creator.name, email: creator.email } : null,
      totalTasks,
      completedTasks,
      progressPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      teamSize: teamMembers.length
    };
    
    return NextResponse.json({
      success: true,
      data: projectWithDetails,
      message: "Proyecto actualizado exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    
    // Manejar errores de formato JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        message: "Formato JSON inválido"
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Método DELETE para eliminar un proyecto
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validar ID
    const projectId = parseInt(id);
    if (isNaN(projectId)) {
      return NextResponse.json({
        success: false,
        message: "ID de proyecto inválido"
      }, { status: 400 });
    }
    
    // Buscar índice del proyecto
    const projectIndex = data.projects.findIndex((project) => project.id === projectId);
    
    if (projectIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Proyecto no encontrado"
      }, { status: 404 });
    }
    
    // Array para acumular errores de validación
    const errors = [];
    
    // Validar que el usuario que realiza la petición sea un gerente
    if (!body.requestedBy || typeof body.requestedBy !== 'number') {
      errors.push("El ID del usuario que realiza la petición es requerido");
    } else {
      const requestingUser = data.users.find(user => user.id === body.requestedBy);
      if (!requestingUser) {
        errors.push("El usuario que realiza la petición no existe");
      } else if (requestingUser.role !== 'gerente') {
        errors.push("Solo los usuarios con rol de gerente pueden eliminar proyectos");
      }
    }
    
    // Si hay errores de validación, retornarlos
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }
    
    // Verificar si el proyecto puede ser eliminado según su estado y tareas
    const hasAssociatedTasks = data.tasks.some(task => task.projectId === projectId);
    
    if (hasAssociatedTasks) {
      const associatedTasks = data.tasks.filter(task => task.projectId === projectId);
      const tasksCount = associatedTasks.length;
      const completedTasks = associatedTasks.filter(task => task.status === 'completado');
      const allTasksCompleted = completedTasks.length === tasksCount;
      const currentProject = data.projects[projectIndex];
      
      // Verificar si se puede eliminar según el estado del proyecto
      let canDelete = false;
      let errorMessage = "";
      let errorDetails = [];
      
      if (currentProject.status === 'completado' && allTasksCompleted) {
        canDelete = true;
      } else if (currentProject.status === 'cancelado') {
        // Incluso para proyectos cancelados, requerir manejo de tareas
        errorMessage = "No se puede eliminar el proyecto cancelado porque tiene tareas asociadas";
        errorDetails = [
          `El proyecto tiene ${tasksCount} tareas asociadas`,
          "Elimine o reasigne las tareas antes de eliminar el proyecto cancelado"
        ];
      } else if (currentProject.status === 'completado' && !allTasksCompleted) {
        errorMessage = "No se puede eliminar el proyecto completado porque tiene tareas sin completar";
        errorDetails = [
          `El proyecto tiene ${tasksCount - completedTasks.length} tareas sin completar`,
          "Complete o reasigne las tareas pendientes antes de eliminar el proyecto"
        ];
      } else {
        // Proyecto en progreso o pendiente
        errorMessage = "No se puede eliminar el proyecto porque tiene tareas asociadas";
        errorDetails = [
          `El proyecto tiene ${tasksCount} tareas asociadas`,
          "Elimine o reasigne las tareas antes de eliminar el proyecto"
        ];
      }
      
      if (!canDelete) {
        const tasksSummary = associatedTasks.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          assignedTo: task.assignedTo
        }));
        
        return NextResponse.json({
          success: false,
          message: errorMessage,
          errors: errorDetails,
          data: {
            projectStatus: currentProject.status,
            tasksCount: tasksCount,
            completedTasksCount: completedTasks.length,
            associatedTasks: tasksSummary
          }
        }, { status: 409 });
      }
    }
    
    // Guardar datos del proyecto eliminado
    const deletedProject = data.projects[projectIndex];
    
    // Eliminar proyecto
    data.projects.splice(projectIndex, 1);
    
    return NextResponse.json({
      success: true,
      data: {
        id: deletedProject.id,
        name: deletedProject.name,
        description: deletedProject.description,
        status: deletedProject.status
      },
      message: "Proyecto eliminado exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    
    // Manejar errores en formato JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        message: "Formato JSON inválido"
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}
