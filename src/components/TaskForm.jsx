import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Type, 
  FileText, 
  Folder, 
  User, 
  Flag, 
  Calendar, 
  PlayCircle,
  Loader2
} from 'lucide-react';

export default function TaskForm({ task = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'media',
    status: 'pendiente',
    dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Cargar datos para los dropdowns
  useEffect(() => {
    if (user?.id) {
      Promise.all([
        fetch(`/api/projects?requestedBy=${user.id}`).then(r => r.json()),
        fetch(`/api/users`).then(r => r.json()) // Los usuarios no requieren requestedBy
      ]).then(([projectsData, usersData]) => {
        if (projectsData.success) setProjects(projectsData.data || []);
        if (usersData.success) setUsers(usersData.data || []);
      }).catch(err => {
        console.error('Error cargando datos:', err);
      });
    }
  }, [user]);

  // Cargar datos de la tarea si estamos editando
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        assignedTo: task.assignedTo || '',
        priority: task.priority || 'media',
        status: task.status || 'pendiente',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Solo validar campos que el usuario puede editar
    if (canEditAllFields()) {
      // Validaciones básicas en el frontend para gerentes
      if (!formData.title.trim()) {
        alert('El título es requerido');
        return;
      }
      
      if (!formData.description.trim()) {
        alert('La descripción es requerida');
        return;
      }
      
      if (!formData.projectId) {
        alert('Debe seleccionar un proyecto');
        return;
      }
      
      if (!formData.assignedTo) {
        alert('Debe asignar la tarea a un usuario');
        return;
      }
      
      if (!formData.dueDate) {
        alert('La fecha de vencimiento es requerida');
        return;
      }
    }
    
    setLoading(true);
    
    const success = await onSave(formData);
    setLoading(false);
    
    if (success) {
      onCancel(); // Cerrar formulario
    }
  };

  // Verificar si el usuario puede editar todos los campos
  const canEditAllFields = () => {
    return user?.role === 'gerente'; // Solo gerentes pueden editar todo
  };

  // Verificar si es una edición de usuario (solo estado)
  const isUserEditing = () => {
    return task && user?.role === 'usuario' && task.assignedTo === user.id;
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-steel-blue">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <PlayCircle size={24} className="text-steel-blue" />
            <h2 className="text-xl font-semibold text-gunmetal">
              {task ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-outer-space hover:bg-mint-green rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title - Solo gerentes pueden editar */}
          {canEditAllFields() && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                <Type size={16} />
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
                placeholder="Nombre de la tarea"
              />
            </div>
          )}

          {/* Description - Solo gerentes pueden editar */}
          {canEditAllFields() && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                <FileText size={16} />
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors resize-none"
                placeholder="Descripción de la tarea"
              />
            </div>
          )}

          {/* Project - Solo gerentes pueden editar */}
          {canEditAllFields() && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                <Folder size={16} />
                Proyecto *
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Assigned To - Solo gerentes pueden editar */}
          {canEditAllFields() && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                <User size={16} />
                Asignado a
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
              >
                <option value="">Sin asignar</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Priority & Status */}
          <div className="grid grid-cols-1 gap-4">
            {/* Priority - Solo gerentes pueden editar */}
            {canEditAllFields() && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                  <Flag size={16} />
                  Prioridad
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            )}

            {/* Status - Todos pueden editar */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                <PlayCircle size={16} />
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en progreso">En Progreso</option>
                <option value="completado">Completada</option>
              </select>
            </div>
          </div>

          {/* Due Date - Solo gerentes pueden editar */}
          {canEditAllFields() && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gunmetal mb-2">
                <Calendar size={16} />
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full p-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
              />
            </div>
          )}

          {/* Información para usuarios que solo pueden cambiar estado */}
          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-outer-space text-outer-space rounded-md hover:bg-mint-green transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-steel-blue text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {task ? (isUserEditing() ? 'Actualizar Estado' : 'Actualizar') : 'Crear'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}