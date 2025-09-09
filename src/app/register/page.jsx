'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/**
 * PÁGINA DE REGISTRO - Creación de nuevos usuarios
 * 
 * Esta página:
 * 1. Presenta formulario completo (nombre, email, password, rol)
 * 2. Valida y crea usuario con /api/users
 * 3. Redirige al login después del registro exitoso
 * 4. Muestra errores de validación si hay problemas
 * 
 * FLUJO:
 * 1. Usuario completa todos los campos
 * 2. handleSubmit → fetch a /api/users (método POST)
 * 3. Si success → redirect /login
 * 4. Si error → mostrar errores en formulario
 * 
 * ROLES DISPONIBLES:
 * - usuario: Puede ver proyectos asignados y actualizar sus tareas
 * - gerente: Puede crear/editar/eliminar proyectos y tareas
 */
export default function RegisterPage() {
  const router = useRouter(); // Para redireccionar después del registro
  
  // Estados del formulario con valores por defecto
  const [formData, setFormData] = useState({
    name: '',              // Nombre completo del usuario
    email: '',             // Email (debe ser único)
    password: '',          // Password
    role: 'usuario'        // Rol por defecto: 'usuario'
  });
  const [errors, setErrors] = useState({});        // Errores de validación del servidor
  const [isLoading, setIsLoading] = useState(false); // Loading durante el submit

  /**
   * MANEJADOR DE CAMBIOS EN LOS INPUTS
   * 
   * Igual que en login, pero maneja más campos:
   * - name, email, password, role
   * 
   * Limpia errores automáticamente cuando el usuario empieza a corregir
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar el campo específico en formData
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * MANEJADOR DEL SUBMIT DEL FORMULARIO DE REGISTRO
   * 
   * Proceso completo de registro:
   * 
   * 1. Prevenir comportamiento default
   * 2. Activar loading y limpiar errores
   * 3. Hacer fetch al endpoint /api/users (POST) con todos los datos
   * 4. Si registro exitoso:
   *    - Mostrar mensaje de éxito
   *    - Redirigir a /login para que el usuario inicie sesión
   * 5. Si hay errores:
   *    - Mostrar errores específicos
   *    - O mostrar mensaje general
   * 6. Siempre desactivar loading
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar recarga de página
    setIsLoading(true);  // Activar loading
    setErrors({});       // Limpiar errores previos

    try {
      // Llamar al endpoint de creación de usuarios
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // Enviar name, email, password, role
      });

      const data = await response.json();

      if (data.success) {
        // REGISTRO EXITOSO
        
        // Feedback al usuario
        alert(data.message || 'Registro exitoso');
        
        // Redirigir al login para que inicie sesión
        router.push('/login');
      } else {
        // ERROR EN REGISTRO
        if (data.errors) {
          setErrors(data.errors);
        } else {
          alert(data.message || 'Error al registrarse');
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4 min-h-full">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* ENCABEZADO DE LA PÁGINA */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gunmetal mb-2">
                Crear Cuenta
              </h1>
              <p className="text-gray-600">
                Completa el formulario para registrarte
              </p>
            </div>

            {/* FORMULARIO DE REGISTRO */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Nombre */}
              <Input
                label="Nombre Completo"
                type="text"
                name="name"                
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                required
                error={errors.name}      
              />

              {/* Campo de Email */}
              <Input
                label="Correo Electrónico"
                type="email"
                name="email"              
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
                error={errors.email}   
              />

              {/* Campo de Password */}
              <Input
                label="Contraseña"
                type="password"
                name="password"          
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 6 caracteres"
                required
                error={errors.password}  
              />

              {/* SELECT DE ROL - Campo personalizado */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gunmetal">
                  Rol <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="role"            
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-steel-blue 
                           focus:ring-opacity-50 focus:border-steel-blue
                           transition-all duration-200"
                  required
                >
                  {/* Opciones de rol disponibles */}
                  <option value="usuario">Usuario</option>
                  <option value="gerente">Gerente</option>
                </select>
                {/* Mostrar error de rol si existe */}
                {errors.role && (
                  <p className="text-red-500 text-sm font-medium">
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Botón de Submit */}
              <div className='flex justify-center'>
                  <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isLoading}
                  >
                  {/* Texto dinámico según el estado */}
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
              </div>
            </form>

            {/* ENLACE A LOGIN */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Button
                  as="a"
                  href="/login"
                  variant="link"
                  className="font-medium"
                >
                  Inicia sesión aquí
                </Button>
              </p>
            </div>
          </div>

          {/* INFORMACIÓN SOBRE ROLES - Ayuda al usuario */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-900 mb-2">
              Información sobre roles:
            </h3>
            <div className="text-sm text-amber-800 space-y-1">
              <p><strong>Usuario:</strong> Puede ver proyectos y actualizar estado de sus tareas</p>
              <p><strong>Gerente:</strong> Puede crear/editar/eliminar proyectos y tareas</p>
            </div>
          </div>
        </div>
    </div>
  );
}
