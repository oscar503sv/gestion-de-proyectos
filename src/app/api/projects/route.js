import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Función para obtener todos los proyectos
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
    
    let projectsToReturn;
    
    // Si es gerente, puede ver todos los proyectos
    if (requestingUser.role === 'gerente') {
      projectsToReturn = data.projects;
    } 
    // Si es usuario, solo puede ver proyectos donde tiene tareas asignadas
    else if (requestingUser.role === 'usuario') {
      const userTaskProjectIds = data.tasks
        .filter(task => task.assignedTo === requestedBy)
        .map(task => task.projectId);
      
      const uniqueProjectIds = [...new Set(userTaskProjectIds)];
      projectsToReturn = data.projects.filter(project => 
        uniqueProjectIds.includes(project.id)
      );
    }
    else {
      return NextResponse.json({
        success: false,
        message: "Rol de usuario no válido"
      }, { status: 403 });
    }
    
    // Retornar proyectos con información del creador
    const projectsWithCreator = projectsToReturn.map(project => {
      const creator = data.users.find(user => user.id === project.createdBy);
      return {
        ...project,
        createdByUser: creator ? { id: creator.id, name: creator.name, email: creator.email } : null
      };
    });

    return NextResponse.json({
      success: true,
      data: projectsWithCreator,
      message: "Proyectos obtenidos exitosamente"
    }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Función para crear un nuevo proyecto
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validaciones básicas
    const errors = [];
    
    // Validar nombre del proyecto
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push("El nombre del proyecto es requerido");
    } else if (body.name.trim().length < 3) {
      errors.push("El nombre del proyecto debe tener al menos 3 caracteres");
    } else if (body.name.trim().length > 100) {
      errors.push("El nombre del proyecto no puede exceder 100 caracteres");
    }
    
    // Validar descripción
    if (!body.description || typeof body.description !== 'string' || body.description.trim().length === 0) {
      errors.push("La descripción del proyecto es requerida");
    } else if (body.description.trim().length < 10) {
      errors.push("La descripción debe tener al menos 10 caracteres");
    } else if (body.description.trim().length > 500) {
      errors.push("La descripción no puede exceder 500 caracteres");
    }
    
    // Validar fecha límite
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
    
    // Validar usuario creador
    if (!body.createdBy || typeof body.createdBy !== 'number') {
      errors.push("El ID del usuario creador es requerido y debe ser un número");
    } else {
      const userExists = data.users.find(user => user.id === body.createdBy);
      if (!userExists) {
        errors.push("El usuario creador no existe");
      } else if (userExists.role !== 'gerente') {
        errors.push("Solo los usuarios con rol de gerente pueden crear proyectos");
      }
    }
    
    // Validar status del proyecto
    const validStatuses = ["pendiente", "en progreso", "completado", "cancelado"];
    if (body.status && !validStatuses.includes(body.status)) {
      errors.push(`El estado debe ser uno de: ${validStatuses.join(", ")}`);
    }
    
    // Verificar que no exista un proyecto con el mismo nombre
    const existingProject = data.projects.find(project => 
      project.name.toLowerCase().trim() === body.name.toLowerCase().trim()
    );
    if (existingProject) {
      errors.push("Ya existe un proyecto con ese nombre");
    }
    
    // Si hay errores, retornar respuesta con errores
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }
    
    // Crear nuevo proyecto
    const newProject = {
      id: Math.max(...data.projects.map(p => p.id)) + 1,
      name: body.name.trim(),
      description: body.description.trim(),
      status: body.status || "pendiente",
      deadline: body.deadline,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString()
    };
    
    // Agregar el nuevo proyecto a los datos
    data.projects.push(newProject);
    
    // Obtener información del usuario creador para la respuesta
    const creator = data.users.find(user => user.id === newProject.createdBy);
    const projectWithCreator = {
      ...newProject,
      createdByUser: creator ? { id: creator.id, name: creator.name, email: creator.email } : null
    };
    
    return NextResponse.json({
      success: true,
      data: projectWithCreator,
      message: "Proyecto creado exitosamente"
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    
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