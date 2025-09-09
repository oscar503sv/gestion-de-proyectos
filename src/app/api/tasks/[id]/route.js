import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Método GET para obtener una tarea por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const requestedBy = parseInt(searchParams.get('requestedBy'));
    
    // Validar ID de tarea
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: "ID de tarea inválido"
      }, { status: 400 });
    }
    
    // Validar que se proporcione el usuario que hace la petición
    if (!requestedBy || isNaN(requestedBy)) {
      return NextResponse.json({
        success: false,
        message: "El ID del usuario que realiza la petición es requerido"
      }, { status: 400 });
    }
    
    // Buscar la tarea
    const task = data.tasks.find((task) => task.id === taskId);
    
    if (!task) {
      return NextResponse.json({
        success: false,
        message: "Tarea no encontrada"
      }, { status: 404 });
    }
    
    // Verificar que el usuario exista
    const requestingUser = data.users.find(user => user.id === requestedBy);
    if (!requestingUser) {
      return NextResponse.json({
        success: false,
        message: "El usuario que realiza la petición no existe"
      }, { status: 404 });
    }
    
    // Verificar permisos de acceso
    if (requestingUser.role === 'usuario' && task.assignedTo !== requestedBy) {
      return NextResponse.json({
        success: false,
        message: "No tienes permisos para ver esta tarea"
      }, { status: 403 });
    }
    
    // Enriquecer tarea con información adicional
    const assignedUser = data.users.find(user => user.id === task.assignedTo);
    const project = data.projects.find(project => project.id === task.projectId);
    const creator = project ? data.users.find(user => user.id === project.createdBy) : null;
    
    const taskWithDetails = {
      ...task,
      assignedToUser: assignedUser ? { 
        id: assignedUser.id, 
        name: assignedUser.name, 
        email: assignedUser.email 
      } : null,
      project: project ? {
        id: project.id,
        name: project.name,
        status: project.status,
        createdBy: creator ? {
          id: creator.id,
          name: creator.name,
          email: creator.email
        } : null
      } : null
    };
    
    return NextResponse.json({
      success: true,
      data: taskWithDetails,
      message: "Tarea obtenida exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Método PUT para actualizar una tarea
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validar ID
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: "ID de tarea inválido"
      }, { status: 400 });
    }
    
    const taskIndex = data.tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Tarea no encontrada"
      }, { status: 404 });
    }

    // Array para acumular errores de validación
    const errors = [];
    
    // Validar usuario que realiza la petición
    if (!body.requestedBy || typeof body.requestedBy !== 'number') {
      errors.push("El ID del usuario que realiza la petición es requerido");
    } else {
      const requestingUser = data.users.find(user => user.id === body.requestedBy);
      if (!requestingUser) {
        errors.push("El usuario que realiza la petición no existe");
      } else {
        const currentTask = data.tasks[taskIndex];
        
        // Verificar permisos según el rol
        if (requestingUser.role === 'gerente') {
          // Los gerentes pueden actualizar cualquier campo de cualquier tarea
        } else if (requestingUser.role === 'usuario') {
          // Los usuarios solo pueden actualizar el status de sus propias tareas
          if (currentTask.assignedTo !== body.requestedBy) {
            errors.push("Solo puedes actualizar tareas que te han sido asignadas");
          } else {
            // Verificar que solo esté actualizando el status
            const allowedFields = ['status', 'requestedBy'];
            const providedFields = Object.keys(body);
            const unauthorizedFields = providedFields.filter(field => !allowedFields.includes(field));
            
            if (unauthorizedFields.length > 0) {
              errors.push("Solo puedes actualizar el estado de tus tareas asignadas");
            }
          }
        } else {
          errors.push("Rol de usuario no válido");
        }
      }
    }
    
    // Validar título (si se proporciona y el usuario es gerente)
    if (body.title !== undefined) {
      if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
        errors.push("El título de la tarea es requerido");
      } else if (body.title.trim().length < 3) {
        errors.push("El título de la tarea debe tener al menos 3 caracteres");
      } else if (body.title.trim().length > 100) {
        errors.push("El título de la tarea no puede exceder 100 caracteres");
      }
    }
    
    // Validar descripción (si se proporciona y el usuario es gerente)
    if (body.description !== undefined) {
      if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
        errors.push("La descripción de la tarea es requerida");
      } else if (body.description.trim().length < 10) {
        errors.push("La descripción debe tener al menos 10 caracteres");
      } else if (body.description.trim().length > 500) {
        errors.push("La descripción no puede exceder 500 caracteres");
      }
    }
    
    // Validar proyecto (si se proporciona y el usuario es gerente)
    if (body.projectId !== undefined) {
      if (!body.projectId || typeof body.projectId !== 'number') {
        errors.push("El ID del proyecto debe ser un número");
      } else {
        const projectExists = data.projects.find(project => project.id === body.projectId);
        if (!projectExists) {
          errors.push("El proyecto especificado no existe");
        }
      }
    }
    
    // Validar usuario asignado (si se proporciona y el usuario es gerente)
    if (body.assignedTo !== undefined) {
      if (!body.assignedTo || typeof body.assignedTo !== 'number') {
        errors.push("El ID del usuario asignado debe ser un número");
      } else {
        const assignedUser = data.users.find(user => user.id === body.assignedTo);
        if (!assignedUser) {
          errors.push("El usuario asignado no existe");
        }
      }
    }
    
    // Validar fecha de vencimiento (si se proporciona y el usuario es gerente)
    if (body.dueDate !== undefined) {
      if (!body.dueDate || typeof body.dueDate !== 'string') {
        errors.push("La fecha de vencimiento es requerida");
      } else if (!validator.isISO8601(body.dueDate)) {
        errors.push("La fecha de vencimiento debe estar en formato ISO8601");
      } else {
        const dueDate = new Date(body.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          errors.push("La fecha de vencimiento no puede ser anterior a hoy");
        }
      }
    }
    
    // Validar prioridad (si se proporciona)
    if (body.priority !== undefined) {
      const validPriorities = ["baja", "media", "alta"];
      if (!validPriorities.includes(body.priority)) {
        errors.push(`La prioridad debe ser una de: ${validPriorities.join(", ")}`);
      }
    }
    
    // Validar status (si se proporciona)
    if (body.status !== undefined) {
      const validStatuses = ["pendiente", "en progreso", "completado"];
      if (!validStatuses.includes(body.status)) {
        errors.push(`El estado debe ser uno de: ${validStatuses.join(", ")}`);
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
    const updatedTask = { ...data.tasks[taskIndex] };
    
    if (body.title !== undefined) updatedTask.title = body.title.trim();
    if (body.description !== undefined) updatedTask.description = body.description.trim();
    if (body.status !== undefined) updatedTask.status = body.status;
    if (body.priority !== undefined) updatedTask.priority = body.priority;
    if (body.projectId !== undefined) updatedTask.projectId = body.projectId;
    if (body.assignedTo !== undefined) updatedTask.assignedTo = body.assignedTo;
    if (body.dueDate !== undefined) updatedTask.dueDate = body.dueDate;
    
    // Guardar cambios
    data.tasks[taskIndex] = updatedTask;
    
    // Obtener información adicional para la respuesta
    const assignedUser = data.users.find(user => user.id === updatedTask.assignedTo);
    const project = data.projects.find(project => project.id === updatedTask.projectId);
    const taskWithDetails = {
      ...updatedTask,
      assignedToUser: assignedUser ? { 
        id: assignedUser.id, 
        name: assignedUser.name, 
        email: assignedUser.email 
      } : null,
      project: project ? {
        id: project.id,
        name: project.name,
        status: project.status
      } : null
    };
    
    return NextResponse.json({
      success: true,
      data: taskWithDetails,
      message: "Tarea actualizada exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    
    // Manejar errores específicos de JSON
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

// Método DELETE para eliminar una tarea
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validar ID
    const taskId = parseInt(id);
    if (isNaN(taskId)) {
      return NextResponse.json({
        success: false,
        message: "ID de tarea inválido"
      }, { status: 400 });
    }
    
    // Buscar índice de la tarea
    const taskIndex = data.tasks.findIndex((task) => task.id === taskId);
    
    if (taskIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Tarea no encontrada"
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
        errors.push("Solo los usuarios con rol de gerente pueden eliminar tareas");
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
    
    // Guardar datos de la tarea eliminada
    const deletedTask = data.tasks[taskIndex];
    
    // Eliminar tarea
    data.tasks.splice(taskIndex, 1);
    
    return NextResponse.json({
      success: true,
      data: {
        id: deletedTask.id,
        title: deletedTask.title,
        status: deletedTask.status,
        projectId: deletedTask.projectId
      },
      message: "Tarea eliminada exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    
    // Manejar errores en estructura JSON
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
