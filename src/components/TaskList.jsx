import { useState, useEffect } from 'react';
import { 
  Plus, 
  Filter, 
  CheckSquare, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { useTasks } from '../hooks/useTasks';

export default function TaskList() {
  const { tasks, loading, error, createTask, updateTask, deleteTask, refetch } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });

  // Cargar datos del usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Filtrar tareas según rol del usuario
  const getFilteredTasks = () => {
    let userTasks = tasks;
    
    // Si es usuario, solo mostrar sus tareas asignadas
    if (user?.role === 'usuario') {
      userTasks = tasks.filter(task => task.assignedTo === user.id);
    }
    // Si es gerente, mostrar todas las tareas (no filtrar por usuario)

    // Aplicar filtros adicionales
    return userTasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      return true;
    });
  };

  const filteredTasks = getFilteredTasks();

  // Verificar permisos de edición
  const canEditTask = (task) => {
    if (user?.role === 'gerente') return true; // Gerentes pueden editar todo
    if (user?.role === 'usuario' && task.assignedTo === user.id) return true; // Usuarios solo sus tareas
    return false;
  };

  // Verificar permisos de eliminación
  const canDeleteTask = (task) => {
    return user?.role === 'gerente'; // Solo gerentes pueden eliminar
  };

  // Verificar permisos de creación
  const canCreateTask = () => {
    return user?.role === 'gerente'; // Solo gerentes pueden crear
  };

  const handleSave = async (taskData) => {
    if (editingTask) {
      return await updateTask(editingTask.id, taskData);
    } else {
      return await createTask(taskData);
    }
  };

  const handleEdit = (task) => {
    // Verificar permisos antes de permitir edición
    if (!canEditTask(task)) {
      alert('No tienes permisos para editar esta tarea');
      return;
    }
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!canDeleteTask(task)) {
      alert('No tienes permisos para eliminar esta tarea');
      return false;
    }
    return await deleteTask(taskId);
  };

  const handleCreateNew = () => {
    if (!canCreateTask()) {
      alert('Solo los gerentes pueden crear nuevas tareas');
      return;
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '' });
  };

  const hasActiveFilters = filters.status || filters.priority;

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-steel-blue">
          <RefreshCw size={20} className="animate-spin" />
          Cargando tareas...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <CheckSquare size={32} className="text-steel-blue" />
          <h1 className="text-2xl font-bold text-gunmetal">Gestión de Tareas</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 border border-steel-blue text-steel-blue rounded-md hover:bg-mint-green transition-colors"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          {canCreateTask() && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-steel-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              <Plus size={20} />
              Nueva Tarea
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-outer-space" />
            <span className="text-sm font-medium text-gunmetal">Filtros:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-outer-space rounded-md text-sm focus:ring-2 focus:ring-steel-blue"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en progreso">En Progreso</option>
            <option value="completado">Completadas</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-outer-space rounded-md text-sm focus:ring-2 focus:ring-steel-blue"
          >
            <option value="">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-steel-blue hover:bg-mint-green rounded-md transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-3 text-sm text-outer-space">
            Mostrando {filteredTasks.length} de {tasks.length} tareas
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEditTask(task)}
            canDelete={canDeleteTask(task)}
            userRole={user?.role}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-outer-space mb-4" />
          <p className="text-outer-space text-lg mb-2">
            {tasks.length === 0 ? 
              (user?.role === 'gerente' ? 'No hay tareas creadas' : 'No tienes tareas asignadas') : 
              'No hay tareas que coincidan con los filtros'
            }
          </p>
          <p className="text-outer-space text-sm">
            {tasks.length === 0 ? 
              (user?.role === 'gerente' ? 'Crea tu primera tarea para comenzar' : 'El gerente te asignará tareas pronto') : 
              'Ajusta los filtros para ver más tareas'
            }
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}