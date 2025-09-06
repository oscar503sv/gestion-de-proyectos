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
    
    return NextResponse.json(usersWithoutPassword)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener usuarios' }, 
      { status: 500 }
    )
  }
}

// Método POST para crear un nuevo usuario
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body
    
    // Validación básica
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validaciones para el nombre
    const cleanName = validator.trim(name || '')

    // al menos 2 y máximo 100 caracteres
    if (!validator.isLength(cleanName, { min: 2, max: 50 })) {
        return NextResponse.json({ error: 'El nombre completo debe tener entre 2 y 50 caracteres' }, { status: 400 })
    }

    // letras, espacios, tildes, guiones y apóstrofos son aceptados
    const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/
    if (!namePattern.test(cleanName)) {
        return NextResponse.json({ error: 'El nombre solo puede contener letras, espacios, guiones y apóstrofos' }, { status: 400 })
    }

    // Verificar que el rol sea válido
    const validRoles = ['gerente', 'usuario']
    const cleanRole = validator.trim(role).toLowerCase()
    if (!validRoles.includes(cleanRole)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    // Verificar formato del email
    const cleanEmail = validator.normalizeEmail(email)
    if (!cleanEmail || !validator.isEmail(cleanEmail)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = data.users.find(user => user.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está en uso' },
        { status: 409 }
      )
    }
    
    // Crear nuevo usuario
    const newUser = {
      id: Math.max(...data.users.map(u => u.id)) + 1,
      name,
      email,
      password,
      role
    }
    
    data.users.push(newUser)
    
    // Retornar sin password
    const { password: _, ...userResponse } = newUser
    return NextResponse.json(userResponse, { status: 201 })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}
