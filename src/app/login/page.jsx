'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * PÁGINA DE LOGIN - Autenticación de usuarios
 * 
 * Esta página:
 * 1. Presenta formulario de email y password
 * 2. Valida credenciales con /api/auth/login
 * 3. Guarda sessionToken en localStorage si login exitoso
 * 4. Redirige al dashboard después del login
 * 5. Muestra errores de validación si hay problemas
 * 
 * FLUJO:
 * 1. Usuario ingresa email/password
 * 2. handleSubmit → fetch a /api/auth/login
 * 3. Si success → localStorage + redirect /dashboard
 * 4. Si error → mostrar errores en el formulario
 * 
 * CREDENCIALES DE PRUEBA:
 * - Gerente: juan@proyecto.com / password123
 * - Usuario: maria@proyecto.com / password123
 */
export default function LoginPage() {
  const router = useRouter(); // Para redireccionar después del login
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    email: '',     // Email del usuario
    password: ''   // Password del usuario
  });
  const [errors, setErrors] = useState({});        // Errores de validación del servidor
  const [isLoading, setIsLoading] = useState(false); // Loading durante el submit

  /**
   * MANEJADOR DE CAMBIOS EN LOS INPUTS
   * 
   * Se ejecuta cada vez que el usuario escribe en email o password
   * 
   * Funciones:
   * 1. Actualiza el estado formData con el nuevo valor
   * 2. Limpia los errores del campo cuando el usuario empieza a escribir
   * 
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target; // name = 'email' o 'password', value = lo que escribió
    
    // Actualizar el estado con el nuevo valor
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error específico del campo cuando empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * MANEJADOR DEL SUBMIT DEL FORMULARIO
   * 
   * Este es el proceso completo de login:
   * 
   * 1. Prevenir el comportamiento default del form
   * 2. Activar loading y limpiar errores previos
   * 3. Hacer fetch al endpoint /api/auth/login con email y password
   * 4. Si login exitoso:
   *    - Guardar sessionToken y datos del usuario en localStorage
   *    - Redirigir al dashboard
   * 5. Si hay errores:
   *    - Mostrar errores específicos en el formulario
   *    - O mostrar mensaje general de error
   * 6. Siempre desactivar loading al final
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar que el form recargue la página
    setIsLoading(true);  // Activar estado de loading
    setErrors({});       // Limpiar errores previos

    try {
      // Llamar al endpoint de login con las credenciales
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // Enviar email y password
      });

      const data = await response.json();

      if (data.success) {
        // LOGIN EXITOSO
        
        // Guardar sessionToken para futuras peticiones autenticadas
        localStorage.setItem('sessionToken', data.data.sessionToken);
        // Guardar datos del usuario para mostrar en el dashboard
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Feedback al usuario
        alert(data.message || 'Inicio de sesión exitoso');
        
        // Redirigir al dashboard
        router.push('/dashboard');
      } else {
        // ERROR EN LOGIN
        
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert(data.message || 'Error al iniciar sesión');
        }
      }
    } catch (error) {
      // Error de conexión o problema técnico
      console.error('Error de conexión:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false); // Siempre desactivar loading
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4 min-h-full">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* ENCABEZADO DE LA PÁGINA */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gunmetal mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-gray-600">
                Ingresa tus credenciales para acceder
              </p>
            </div>

            {/* FORMULARIO DE LOGIN */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Email */}
              <Input
                label="Correo Electrónico"
                type="email"
                name="email"              
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
                error={errors.email}     // Muestra error específico si existe
              />

              {/* Campo de Password */}
              <Input
                label="Contraseña"
                type="password"
                name="password"          
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Tu contraseña"
                required
                error={errors.password}  
              />

              {/* Botón de Submit */}
              <div className='flex justify-center'>
                  <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading} // Deshabilita el botón si está cargando
                  >
                  {/* Texto dinámico según el estado */}
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
              </div>
            </form>

            {/* ENLACE A REGISTRO */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Button
                  as="a"
                  href="/register"
                  variant="link"
                  className="font-medium"
                >
                  Regístrate aquí
                </Button>
              </p>
            </div>
          </div>

          {/* CREDENCIALES DE PRUEBA */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Credenciales de prueba:
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Gerente:</strong> juan@proyecto.com / password123</p>
              <p><strong>Usuario:</strong> maria@proyecto.com / password123</p>
            </div>
          </div>
        </div>
    </div>
  );
}
