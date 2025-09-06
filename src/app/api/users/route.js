import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Médoto GET para obtener todos los usuarios
export async function GET() {
  try {
    // Remover las contraseñas antes de enviar la respuesta
    const usersWithoutPassword = data.users.map(user => {
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    
    return NextResponse.json({
      success: true,
      data: usersWithoutPassword,
      message: "Usuarios obtenidos exitosamente"
    }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor"
    }, { status: 500 })
  }
}

// Método POST para crear un nuevo usuario
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body
    
    // Array para acumular errores de validación
    const errors = [];
    
    // Validación de campos requeridos
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push("El nombre es requerido");
    }
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push("El email es requerido");
    }
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      errors.push("La contraseña es requerida");
    }
    if (!role || typeof role !== 'string' || role.trim().length === 0) {
      errors.push("El rol es requerido");
    }

    // Si faltan campos básicos, retornar errores inmediatamente
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }

    // Validaciones para el nombre
    const cleanName = validator.trim(name)

    // al menos 2 y máximo 50 caracteres
    if (!validator.isLength(cleanName, { min: 2, max: 50 })) {
      errors.push('El nombre completo debe tener entre 2 y 50 caracteres');
    }

    // letras, espacios, tildes, guiones y apóstrofos son aceptados
    const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
    if (!namePattern.test(cleanName)) {
      errors.push('El nombre solo puede contener letras, espacios, guiones y apóstrofos');
    }

    // Verificar que el rol sea válido
    const validRoles = ['gerente', 'usuario']
    const cleanRole = validator.trim(role).toLowerCase()
    if (!validRoles.includes(cleanRole)) {
      errors.push(`El rol debe ser uno de: ${validRoles.join(", ")}`);
    }

    // Verificar formato del email
    const cleanEmail = validator.normalizeEmail(email)
    if (!cleanEmail || !validator.isEmail(cleanEmail)) {
      errors.push('El formato del email es inválido');
    }

    // Verificar si el email ya existe
    const existingUser = data.users.find(user => user.email.toLowerCase() === cleanEmail.toLowerCase())
    if (existingUser) {
      errors.push('El email ya está registrado');
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Si hay errores de validación, retornarlos
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: Math.max(...data.users.map(u => u.id)) + 1,
      name: cleanName,
      email: cleanEmail,
      password,
      role: cleanRole
    }
    
    data.users.push(newUser)
    
    // Retornar sin password
    const { password: _, ...userResponse } = newUser
    return NextResponse.json({
      success: true,
      data: userResponse,
      message: "Usuario creado exitosamente"
    }, { status: 201 })
    
  } catch (error) {
    console.error("Error al crear usuario:", error);
    
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
    }, { status: 500 })
  }
}
