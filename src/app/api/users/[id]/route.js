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
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }
    
    // Buscar el usuario
    const user = data.users.find((user) => user.id === userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    // Remover password por seguridad
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
    
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Actualizar un usuario por ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, email, password } = await request.json();
    const userIndex = data.users.findIndex((user) => user.id === parseInt(id));

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const cleanName = validator.trim(name || "");

    if (!validator.isLength(cleanName, { min: 2, max: 50 })) {
      return NextResponse.json(
        { error: "El nombre completo debe tener entre 2 y 50 caracteres" },
        { status: 400 }
      );
    }

    // letras, espacios, tildes, guiones y apóstrofos son aceptados
    const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
    if (!namePattern.test(cleanName)) {
      return NextResponse.json(
        {
          error:
            "El nombre solo puede contener letras, espacios, guiones y apóstrofos",
        },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: "Correo electrónico no válido" },
        { status: 400 }
      );
    }
    // Verificar si el email ya está en uso por otro usuario
    const emailInUse = data.users.some(
      (user, index) => user.email === validator.normalizeEmail(email) && index !== userIndex
    );

    if (emailInUse) {
      return NextResponse.json(
        { error: "El correo electrónico ya está en uso" },
        { status: 400 }
      );
    }

    // actualizar usuario
    data.users[userIndex] = {
      ...data.users[userIndex],
      name: cleanName,
      email: validator.normalizeEmail(email),
      password,
    };
    const { password: pwd, ...updatedUser } = data.users[userIndex];
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

// Eliminar un usuario por ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Con await
    
    // Validar ID
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }
    
    // Buscar índice del usuario
    const userIndex = data.users.findIndex((user) => user.id === userId);
    
    if (userIndex === -1) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar si el usuario tiene dependencias antes de eliminar
    const hasProjects = data.projects.some(project => project.createdBy === userId);
    const hasTasks = data.tasks.some(task => task.assignedTo === userId);
    
    if (hasProjects || hasTasks) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar el usuario",
          reason: "El usuario tiene proyectos creados o tareas asignadas",
          details: {
            projectsCount: data.projects.filter(p => p.createdBy === userId).length,
            tasksCount: data.tasks.filter(t => t.assignedTo === userId).length
          }
        },
        { status: 409 }
      );
    }
    
    // Guardar datos del usuario eliminado
    const deletedUser = data.users[userIndex];
    
    // Eliminar usuario
    data.users.splice(userIndex, 1);
    
    return NextResponse.json({ 
      message: "Usuario eliminado exitosamente",
      deletedUser: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
