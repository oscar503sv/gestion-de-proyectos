import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Función para obtener todas las tareas
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
    
    let tasksToReturn;
    
    // Si es gerente, puede ver todas las tareas
    if (requestingUser.role === 'gerente') {
      tasksToReturn = data.tasks;
    } 
    // Si es usuario, solo puede ver sus tareas asignadas
    else if (requestingUser.role === 'usuario') {
      tasksToReturn = data.tasks.filter(task => task.assignedTo === requestedBy);
    }
    else {
      return NextResponse.json({
        success: false,
        message: "Rol de usuario no válido"
      }, { status: 403 });
    }
    
    // Enriquecer tareas con información adicional
    const tasksWithDetails = tasksToReturn.map(task => {
      const assignedUser = data.users.find(user => user.id === task.assignedTo);
      const project = data.projects.find(project => project.id === task.projectId);
      const creator = project ? data.users.find(user => user.id === project.createdBy) : null;
      
      return {
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
    });

    return NextResponse.json({
      success: true,
      data: tasksWithDetails,
      message: "Tareas obtenidas exitosamente"
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Función para crear una nueva tarea
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validaciones básicas
    const errors = [];
    
    // Validar que el usuario que realiza la petición sea un gerente
    if (!body.requestedBy || typeof body.requestedBy !== 'number') {
      errors.push("El ID del usuario que realiza la petición es requerido");
    } else {
      const requestingUser = data.users.find(user => user.id === body.requestedBy);
      if (!requestingUser) {
        errors.push("El usuario que realiza la petición no existe");
      } else if (requestingUser.role !== 'gerente') {
        errors.push("Solo los usuarios con rol de gerente pueden crear tareas");
      }
    }
    
    // Validar título de la tarea
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push("El título de la tarea es requerido");
    } else if (body.title.trim().length < 3) {
      errors.push("El título de la tarea debe tener al menos 3 caracteres");
    } else if (body.title.trim().length > 100) {
      errors.push("El título de la tarea no puede exceder 100 caracteres");
    }
    
    // Validar descripción
    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      errors.push("La descripción de la tarea es requerida");
    } else if (body.description.trim().length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    } else if (body.description.trim().length > 500) {
      errors.push("La descripción no puede exceder 500 caracteres");
    }
    
    // Validar proyecto
    if (!body.projectId || typeof body.projectId !== 'number') {
      errors.push("El ID del proyecto es requerido y debe ser un número");
    } else {
      const projectExists = data.projects.find(project => project.id === body.projectId);
      if (!projectExists) {
        errors.push("El proyecto especificado no existe");
      }
    }
    
    // Validar usuario asignado
    if (!body.assignedTo || typeof body.assignedTo !== 'number') {
      errors.push("El ID del usuario asignado es requerido y debe ser un número");
    } else {
      const assignedUser = data.users.find(user => user.id === body.assignedTo);
      if (!assignedUser) {
        errors.push("El usuario asignado no existe");
      }
    }
    
    // Validar fecha de vencimiento
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
    
    // Validar prioridad
    const validPriorities = ["baja", "media", "alta"];
    if (body.priority && !validPriorities.includes(body.priority)) {
      errors.push(`La prioridad debe ser una de: ${validPriorities.join(", ")}`);
    }
    
    // Validar status
    const validStatuses = ["pendiente", "en progreso", "completado"];
    if (body.status && !validStatuses.includes(body.status)) {
      errors.push(`El estado debe ser uno de: ${validStatuses.join(", ")}`);
    }
    
    // Si hay errores, retornar respuesta con errores
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }
    
    // Crear nueva tarea con ID más robusto
    const newTaskId = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1;
    const newTask = {
      id: newTaskId,
      title: body.title.trim(),
      description: body.description.trim(),
      status: body.status || "pendiente",
      priority: body.priority || "media",
      projectId: body.projectId,
      assignedTo: body.assignedTo,
      createdAt: new Date().toISOString(),
      dueDate: body.dueDate
    };
    
    // Agregar la nueva tarea a los datos
    data.tasks.push(newTask);
    
    // Obtener información adicional para la respuesta
    const assignedUser = data.users.find(user => user.id === newTask.assignedTo);
    const project = data.projects.find(project => project.id === newTask.projectId);
    const taskWithDetails = {
      ...newTask,
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
      message: "Tarea creada exitosamente"
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error al crear tarea:", error);
    
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

