import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ProjectForm({ project = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'pendiente',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Cargar datos del proyecto si estamos editando
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'pendiente',
        deadline: project.deadline ? project.deadline.split('T')[0] : ''
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones del frontend
    if (!formData.name.trim()) {
      alert('El nombre del proyecto es requerido');
      return;
    }
    
    if (formData.name.trim().length < 3) {
      alert('El nombre del proyecto debe tener al menos 3 caracteres');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('La descripción del proyecto es requerida');
      return;
    }
    
    if (formData.description.trim().length < 10) {
      alert('La descripción debe tener al menos 10 caracteres');
      return;
    }
    
    if (!formData.deadline) {
      alert('La fecha límite es requerida');
      return;
    }

    // Validar que la fecha no sea anterior a hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.deadline);
    
    if (selectedDate < today) {
      alert('La fecha límite no puede ser anterior a hoy');
      return;
    }
    
    setLoading(true);
    
    const success = await onSave(formData);
    setLoading(false);
    
    if (success) {
      onCancel(); // Cerrar modal si fue exitoso
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Solo gerentes pueden usar este formulario
  if (!user || user.role !== 'gerente') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl border-2 border-steel-blue">
          <h2 className="text-xl font-bold text-gunmetal mb-4">Acceso Denegado</h2>
          <p className="text-outer-space mb-4">
            Solo los gerentes pueden crear y editar proyectos.
          </p>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 bg-steel-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-steel-blue">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gunmetal">
            {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-outer-space hover:bg-mint-green rounded-md transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre del Proyecto */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gunmetal mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Desarrollo de Sitio Web"
              className="w-full px-4 py-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              required
            />
            <p className="text-xs text-outer-space mt-1">
              Mínimo 3 caracteres, máximo 100 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gunmetal mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe el proyecto, objetivos y alcance..."
              rows={4}
              className="w-full px-4 py-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent resize-vertical"
              required
            />
            <p className="text-xs text-outer-space mt-1">
              Mínimo 10 caracteres, máximo 500 caracteres
            </p>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gunmetal mb-2">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En Progreso</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          {/* Fecha Límite */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gunmetal mb-2">
              Fecha Límite *
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent"
              required
            />
            <p className="text-xs text-outer-space mt-1">
              La fecha no puede ser anterior a hoy
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-outer-space text-outer-space rounded-md hover:bg-mint-green transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-steel-blue text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : (project ? 'Actualizar' : 'Crear Proyecto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}