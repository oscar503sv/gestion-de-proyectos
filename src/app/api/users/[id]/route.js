import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Obtener un usuario por ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Validar que el ID sea un número válido
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: "ID de usuario inválido"
      }, { status: 400 });
    }
    
    // Buscar el usuario
    const user = data.users.find((user) => user.id === userId);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado"
      }, { status: 404 });
    }
    
    // Remover password por seguridad
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: "Usuario obtenido exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}

// Actualizar un usuario por ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, email, password } = await request.json();
    
    // Validar ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: "ID de usuario inválido"
      }, { status: 400 });
    }
    
    const userIndex = data.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado"
      }, { status: 404 });
    }

    // Array para acumular errores de validación
    const errors = [];
    
    // Validar campos requeridos
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push("El nombre es requerido");
    }
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push("El email es requerido");
    }
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      errors.push("La contraseña es requerida");
    }

    // Si faltan campos básicos, retornar errores
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }

    const cleanName = validator.trim(name);

    if (!validator.isLength(cleanName, { min: 2, max: 50 })) {
      errors.push("El nombre completo debe tener entre 2 y 50 caracteres");
    }

    // letras, espacios, tildes, guiones y apóstrofos son aceptados
    const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    if (!namePattern.test(cleanName)) {
      errors.push("El nombre solo puede contener letras, espacios, guiones y apóstrofos");
    }

    if (!validator.isEmail(email)) {
      errors.push("El formato del email es inválido");
    }
    
    // Normalizar email
    const cleanEmail = validator.normalizeEmail(email);
    
    // Verificar si el email ya está en uso por otro usuario
    const emailInUse = data.users.some(
      (user, index) => user.email.toLowerCase() === cleanEmail.toLowerCase() && index !== userIndex
    );

    if (emailInUse) {
      errors.push("El email ya está registrado por otro usuario");
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }

    // Si hay errores de validación, retornarlos
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }

    // actualizar usuario
    data.users[userIndex] = {
      ...data.users[userIndex],
      name: cleanName,
      email: cleanEmail,
      password,
    };
    
    const { password: pwd, ...updatedUser } = data.users[userIndex];
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Usuario actualizado exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    
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

// Eliminar un usuario por ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Validar ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: "ID de usuario inválido"
      }, { status: 400 });
    }
    
    // Buscar índice del usuario
    const userIndex = data.users.findIndex((user) => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json({
        success: false,
        message: "Usuario no encontrado"
      }, { status: 404 });
    }
    
    // Verificar si el usuario tiene dependencias antes de eliminar
    const hasProjects = data.projects.some(project => project.createdBy === userId);
    const hasTasks = data.tasks.some(task => task.assignedTo === userId);
    
    if (hasProjects || hasTasks) {
      const projectsCount = data.projects.filter(p => p.createdBy === userId).length;
      const tasksCount = data.tasks.filter(t => t.assignedTo === userId).length;
      
      return NextResponse.json({
        success: false,
        message: "No se puede eliminar el usuario porque tiene dependencias",
        errors: [
          "El usuario tiene proyectos creados o tareas asignadas",
          `Proyectos creados: ${projectsCount}`,
          `Tareas asignadas: ${tasksCount}`
        ]
      }, { status: 409 });
    }
    
    // Guardar datos del usuario eliminado
    const deletedUser = data.users[userIndex];
    
    // Eliminar usuario
    data.users.splice(userIndex, 1);
    
    return NextResponse.json({
      success: true,
      data: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email
      },
      message: "Usuario eliminado exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}
