'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/buscador';
import Task from '@/components/Task';
import TaskForm from '@/components/RegistrarTask';

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


  const [tasks, setTasks] = useState([
    { id: 1, titulo: "Sistema De Inventario", descripcion: "Agregar lista de tareas", prioridad: "Alta", estatus: "Pendiente", encargado: "", proyectoId: "am" },
    { id: 2, titulo: "Desarrollo de sitio web", descripcion: "Agregar lista de tareas", prioridad: "Intermedia", estatus: "Pendiente", encargado: "", proyectoId: "dsw" },
    { id: 3, titulo: "App movil", descripcion: "Agregar lista de tareas", prioridad: "Baja", estatus: "Pendiente", encargado: "", proyectoId: "sdi" },
  ]);

  const router = useRouter(); // Para navegación programática (redirecciones)

  // Estados principales del componente
  const [user, setUser] = useState(null);        // Datos del usuario logueado
  const [stats, setStats] = useState(null);      // Estadísticas del dashboard desde la API
  const [isLoading, setIsLoading] = useState(true);
  const [taskVisible, setTaskVisble] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

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


  const handleEditTask = (updatedTask) => {
    console.log("Editar tarea:", updatedTask);
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };


  const handleCompleteTask = (id) => {
    console.log("Finalizar tarea ID:", id);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? {
          ...task, estatus: "Completada", fechaFinalizacion: new Date().toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        } : task
      )
    );
  };



  function llamarTask() {
    setTaskVisble((value) => !value)
  }

  function registrarTask(newTask) {
    setShowForm(true)

  }


  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, { id: Date.now(), ...newTask }]);
  };




  const handleDeleteTask = (id) => {
    setTaskToDelete(id); // guardamos cuál se quiere borrar
  };

  const confirmDelete = () => {
    setTasks((prev) => prev.filter((task) => task.id !== taskToDelete));
    setTaskToDelete(null); // cerramos el modal
  };

  const cancelDelete = () => {
    setTaskToDelete(null); // cerramos el modal
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

          {/* funcionalidad del placeholder buscador dentro del dashboard */}

          <div className="flex-1 flex justify-center px-8">
            <SearchBar />
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
              onClick={() => llamarTask()}
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




        {taskVisible ? (<div className="bg-white rounded-lg shadow-sm p-6" id="task-div">
          <h2 className="text-xl font-semibold text-gunmetal mb-4">

            <Button
              variant="outline"
              className="justify-center"
              onClick={() => { setEditingTask(null); registrarTask(); }}
            >
              Crear Tarea
            </Button>
            <TaskForm
              visible={showForm}
              onAdd={(task) => console.log("Nueva tarea:", task)}
              onClose={() => setShowForm(false)}
              save={editingTask ? handleEditTask : handleAddTask}
              task={editingTask}
              user={user}
              editingTask={editingTask}
            />
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {/* TODO: Cambiar este onClick por router.push('/projects') */}

            {tasks.map((task) => (
              <Task
                key={task.id}
                titulo={task.titulo}
                descripcion={task.descripcion}
                proyectoId={task.proyectoId}
                prioridad={task.prioridad}
                estatus={task.estatus}
                encargado={task.encargado}
                fechaRegistro={task.fechaRegistro}
                fechaFinalizacion={task.fechaFinalizacion}
                fechaModificacion={task.fechaModificacion}
                onEdit={() => { setEditingTask(task); registrarTask(); }}
                onComplete={() => handleCompleteTask(task.id)}
                onDelete={() => handleDeleteTask(task.id)}

              />
            ))}


          </div>
        </div>) : ""}

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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${project.status === 'completado' ? 'bg-green-100 text-green-800' :
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

        {taskToDelete !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-lg font-semibold text-red-600 mb-4">
                ⚠️ Eliminar tarea
              </h2>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que quieres eliminar esta tarea?
                <br />
                <span className="font-bold">Este proceso no tiene reversa.</span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
                >
                  Eliminar
                </button>
              </div>
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
