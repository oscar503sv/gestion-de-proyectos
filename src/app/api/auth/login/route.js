import { NextResponse } from "next/server";
import data from "@/app/lib/data.js";
import validator from "validator";

// Método POST para autenticación de usuarios
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Array para acumular errores de validación
    const errors = [];
    
    // Validaciones básicas
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push("El email es requerido");
    } else if (!validator.isEmail(email)) {
      errors.push("El formato del email es inválido");
    }
    
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      errors.push("La contraseña es requerida");
    }
    
    // Si hay errores de validación, retornarlos
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Errores de validación",
        errors: errors
      }, { status: 400 });
    }
    
    // Normalizar email para comparación
    const cleanEmail = validator.normalizeEmail(email);
    
    // Buscar usuario por email y password
    const user = data.users.find(u => 
      u.email.toLowerCase() === cleanEmail.toLowerCase() && 
      u.password === password
    );
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Credenciales inválidas"
      }, { status: 401 });
    }
    
    // Retornar datos del usuario sin password
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        sessionToken: `session_${user.id}_${Date.now()}` // Token simple para el frontend
      },
      message: "Autenticación exitosa"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error en autenticación:", error);
    
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
