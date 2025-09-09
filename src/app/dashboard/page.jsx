'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

/**
 * DASHBOARD PRINCIPAL - Página protegida que muestra estadísticas del usuario
 * 
 * Esta página:
 * 1. Verifica que el usuario esté autenticado
 * 2. Carga estadísticas diferentes según el rol (gerente o usuario)
 * 3. Muestra información personalizada para cada tipo de usuario
 * 4. Permite cerrar sesión y redirigir
 * 
 * ROLES:
 * - gerente: Ve estadísticas globales (todos los proyectos, tareas, progreso)
 * - usuario: Ve solo sus tareas asignadas, vencimientos personales
 * 
 * ENDPOINT USADO: /api/dashboard?requestedBy={userId}
 */
export default function DashboardPage() {
  const router = useRouter(); // Para navegación programática (redirecciones)
  
  // Estados principales del componente
  const [user, setUser] = useState(null);        // Datos del usuario logueado
  const [stats, setStats] = useState(null);      // Estadísticas del dashboard desde la API
  const [isLoading, setIsLoading] = useState(true); // Control de loading

  /**
   * EFECTO PRINCIPAL - Se ejecuta al montar el componente
   * 
   * 1. Verifica si hay sesión activa (sessionToken y datos de usuario)
   * 2. Si NO hay sesión → redirige a login
   * 3. Si SÍ hay sesión → carga los datos del usuario y sus estadísticas
   * 
   */
  useEffect(() => {
    // Verificar si hay sesión activa en localStorage
    const sessionToken = localStorage.getItem('sessionToken');
    const userData = localStorage.getItem('user');

    // Si no hay sesión, redirigir al login
    if (!sessionToken || !userData) {
      router.push('/login');
      return;
    }

    // Si hay sesión, parsear los datos del usuario y guardarlos en el estado
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Cargar las estadísticas específicas para este usuario
    loadDashboardStats(sessionToken, parsedUser.id);
  }, []); // Array vacío = se ejecuta solo una vez al cargar la página

  /**
   * FUNCIÓN PARA CARGAR ESTADÍSTICAS DEL DASHBOARD
   * 
   * Hace fetch al endpoint /api/dashboard que devuelve datos diferentes según el rol:
   * 
   * GERENTE recibe:
   * - allProjects: {total, pending, inProgress, completed, canceled}
   * - allTasks: {total, pending, inProgress, completed, overdue, dueSoon}
   * - projectsProgress: array con progreso de cada proyecto
   * - criticalDeadlines: tareas próximas a vencer o vencidas
   * 
   * USUARIO recibe:
   * - myTasks: {total, pending, inProgress, completed, overdue, dueSoon}
   * - myProjects: proyectos donde tiene tareas asignadas
   * - upcomingDeadlines: sus próximos vencimientos personales
   */
  const loadDashboardStats = async (token, userId) => {
    try {
      // El endpoint necesita saber qué usuario está pidiendo los datos
      const response = await fetch(`/api/dashboard?requestedBy=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Token para autenticación
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data); // Guardar las estadísticas en el estado
      } else {
        console.error('Error al cargar estadísticas:', data.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
    } finally {
      setIsLoading(false); // Siempre quitar el loading, haya error o no
    }
  };

  /**
   * FUNCIÓN PARA CERRAR SESIÓN
   * 
   * Pasos:
   * 1. Limpia el localStorage
   * 2. Redirige a la página principal
   * 
   * IMPORTANTE: No es necesario llamar a ningún endpoint para cerrar sesión
   * porque nuestro sistema usa tokens almacenados localmente
   */
  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('user');
    
    // Redirigir al home
    router.push('/');
  };

  // PANTALLA DE CARGA - Se muestra mientras carga las estadísticas
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gunmetal text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* HEADER DEL DASHBOARD - Información del usuario y botón de logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gunmetal">Dashboard</h1>
            <p className="text-gray-600">
              Bienvenido, {user?.name} ({user?.role})
            </p>
          </div>
          {/* Botón para cerrar sesión */}
          <Button 
            variant="secondary" 
            onClick={handleLogout}
            className=""
          >
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DEL DASHBOARD */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* =============================================== */}
        {/* ESTADÍSTICAS PARA GERENTE - Vista global      */}
        {/* =============================================== */}
        {stats && user?.role === 'gerente' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-steel-blue">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Proyectos Activos
              </h3>
              <p className="text-3xl font-bold text-steel-blue">
                {stats.allProjects?.inProgress || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Proyectos Completados
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.allProjects?.completed || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Tareas Pendientes
              </h3>
              <p className="text-3xl font-bold text-amber-600">
                {stats.allTasks?.pending || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Total Proyectos
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.allProjects?.total || 0}
              </p>
            </div>
          </div>
        )}

        {/* =============================================== */}
        {/* ESTADÍSTICAS PARA USUARIO - Vista personal    */}
        {/* =============================================== */}
        {stats && user?.role === 'usuario' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-steel-blue">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Mis Tareas
              </h3>
              <p className="text-3xl font-bold text-steel-blue">
                {stats.myTasks?.total || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Completadas
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {stats.myTasks?.completed || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Pendientes
              </h3>
              <p className="text-3xl font-bold text-amber-600">
                {stats.myTasks?.pending || 0}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                Vencidas
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {stats.myTasks?.overdue || 0}
              </p>
            </div>
          </div>
        )}

        {/* =============================================== */}
        {/* ACCIONES RÁPIDAS - Botones para funciones     */}
        {/* TODO: Conectar estos botones a páginas reales */}
        {/* =============================================== */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gunmetal mb-4">
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TODO: Cambiar este onClick por router.push('/projects') */}
            <Button 
              variant="primary" 
              className="justify-center"
              onClick={() => alert('Funcionalidad en desarrollo')}
            >
              Ver Proyectos
            </Button>
            
            {/* TODO: Cambiar este onClick por router.push('/tasks') */}
            <Button 
              variant="outline" 
              className="justify-center"
              onClick={() => alert('Funcionalidad en desarrollo')}
            >
              Ver Tareas
            </Button>
            
            {/* Solo los gerentes pueden crear proyectos */}
            {user?.role === 'gerente' && (
              <Button 
                variant="secondary" 
                className="justify-center"
                onClick={() => alert('Funcionalidad en desarrollo')}
              >
                Crear Proyecto
              </Button>
            )}
          </div>
        </div>

        {/* =============================================== */}
        {/* PRÓXIMOS VENCIMIENTOS - Solo para usuarios    */}
        {/* =============================================== */}
        {stats && user?.role === 'usuario' && stats.upcomingDeadlines?.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gunmetal mb-4">
              Próximos Vencimientos
            </h2>
            <div className="space-y-3">
              {stats.upcomingDeadlines.slice(0, 5).map((deadline, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <div>
                    <h4 className="font-medium text-gunmetal">{deadline.taskTitle}</h4>
                    <p className="text-sm text-gray-600">{deadline.projectName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-700">
                      {deadline.daysUntilDue === 0 ? 'Hoy' : `${deadline.daysUntilDue} días`}
                    </p>
                    <p className="text-xs text-gray-500">{deadline.dueDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================== */}
        {/* PROGRESO DE PROYECTOS - Solo para gerentes    */}
        {/* =============================================== */}
        {stats && user?.role === 'gerente' && stats.projectsProgress?.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gunmetal mb-4">
              Progreso de Proyectos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.projectsProgress.slice(0, 6).map((project, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gunmetal">{project.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'completado' ? 'bg-green-100 text-green-800' :
                      project.status === 'en progreso' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'pendiente' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-steel-blue h-2 rounded-full" 
                      style={{ width: `${project.progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {project.completedTasks}/{project.totalTasks} tareas ({project.progressPercentage}%)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =============================================== */}
        {/* MENSAJE DE BIENVENIDA - Información contextual */}
        {/* =============================================== */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            ¡Bienvenido a tu Dashboard!
          </h3>
          <p className="text-blue-800">
            Desde aquí podrás gestionar tus proyectos y tareas. 
            {user?.role === 'gerente' 
              ? ' Como gerente, tienes acceso completo para crear y administrar proyectos.'
              : ' Como usuario, puedes ver proyectos asignados y actualizar el estado de tus tareas.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
