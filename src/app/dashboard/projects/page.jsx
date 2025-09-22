'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ProjectList from '@/components/ProjectList';

/**
 * PÁGINA DE GESTIÓN DE PROYECTOS
 * 
 * Esta página:
 * 1. Verifica que el usuario esté autenticado
 * 2. Muestra la gestión completa de proyectos según el rol
 * 3. Gerentes: CRUD completo de proyectos
 * 4. Usuarios: Solo ver proyectos donde tienen tareas asignadas
 * 
 * RUTA: /dashboard/proyectos
 */
export default function ProyectosPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  /**
   * EFECTO PRINCIPAL - Verificar autenticación
   * 
   * 1. Verifica si hay sesión activa (sessionToken y datos de usuario)
   * 2. Si NO hay sesión → redirige a login
   * 3. Si SÍ hay sesión → carga la gestión de proyectos
   */
  useEffect(() => {
    // Verificar autenticación
    const sessionToken = localStorage.getItem('sessionToken');
    const userData = localStorage.getItem('user');
    
    if (!sessionToken || !userData) {
      // No hay sesión, redirigir a login
      router.push('/login');
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      setUser(user);
      setIsLoading(false);
    } catch (error) {
      // Error parseando datos de usuario, limpiar y redirigir
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  // PANTALLA DE CARGA - Mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-steel-blue">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-steel-blue"></div>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Botón de regreso al dashboard */}
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-sm text-outer-space hover:text-steel-blue hover:bg-white rounded-lg transition-colors border border-gray-200 hover:border-steel-blue"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gunmetal">
                  Proyectos
                </h1>
                <p className="text-outer-space mt-1">
                  {user?.role === 'gerente' 
                    ? 'Gestiona todos los proyectos del sistema'
                    : 'Proyectos donde tienes tareas asignadas'
                  }
                </p>
              </div>
            </div>
            
            {/* Información del usuario */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="text-right">
                <p className="text-sm font-medium text-gunmetal">{user?.name}</p>
                <p className="text-xs text-outer-space capitalize">
                  {user?.role}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                user?.role === 'gerente' ? 'bg-steel-blue' : 'bg-ice-blue'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Componente principal de gestión de proyectos */}
        <ProjectList />
      </div>
    </div>
  );
}