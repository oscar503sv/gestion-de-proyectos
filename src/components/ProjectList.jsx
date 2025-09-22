import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import { 
  Folder, 
  Plus, 
  RefreshCw, 
  Filter, 
  AlertCircle,
  Search
} from 'lucide-react';

export default function ProjectList() {
  const { projects, loading, error, createProject, updateProject, deleteProject, refetch } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  // Cargar datos del usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Filtrar proyectos según búsqueda y filtros
  const getFilteredProjects = () => {
    let filteredProjects = projects;
    
    // Filtrar por estado
    if (filters.status) {
      filteredProjects = filteredProjects.filter(project => project.status === filters.status);
    }

    // Filtrar por búsqueda (nombre y descripción)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower)
      );
    }

    return filteredProjects;
  };

  const filteredProjects = getFilteredProjects();

  // Verificar permisos de edición (solo gerentes)
  const canEditProject = () => {
    return user?.role === 'gerente';
  };

  // Verificar permisos de eliminación (solo gerentes)
  const canDeleteProject = () => {
    return user?.role === 'gerente';
  };

  // Verificar permisos de creación (solo gerentes)
  const canCreateProject = () => {
    return user?.role === 'gerente';
  };

  const handleSave = async (projectData) => {
    if (editingProject) {
      return await updateProject(editingProject.id, projectData);
    } else {
      return await createProject(projectData);
    }
  };

  const handleEdit = (project) => {
    if (!canEditProject()) {
      alert('No tienes permisos para editar proyectos');
      return;
    }
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!canDeleteProject()) {
      alert('No tienes permisos para eliminar proyectos');
      return;
    }
    return await deleteProject(projectId);
  };

  const handleCreateNew = () => {
    if (!canCreateProject()) {
      alert('No tienes permisos para crear proyectos');
      return;
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const clearFilters = () => {
    setFilters({ status: '', search: '' });
  };

  const hasActiveFilters = filters.status || filters.search.trim();

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-steel-blue">
          <RefreshCw size={20} className="animate-spin" />
          Cargando proyectos...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Folder size={32} className="text-steel-blue" />
          <h1 className="text-2xl font-bold text-gunmetal">Gestión de Proyectos</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 border border-steel-blue text-steel-blue rounded-md hover:bg-mint-green transition-colors"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          {canCreateProject() && (
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-steel-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              <Plus size={20} />
              Nuevo Proyecto
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-outer-space" />
            <span className="text-sm font-medium text-gunmetal">Filtros:</span>
          </div>
          
          {/* Estado Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-outer-space rounded-md text-sm focus:ring-2 focus:ring-steel-blue"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en progreso">En Progreso</option>
            <option value="completado">Completados</option>
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

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-outer-space" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Buscar proyectos por nombre o descripción..."
            className="w-full pl-10 pr-4 py-3 border border-outer-space rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent"
          />
        </div>

        {hasActiveFilters && (
          <div className="text-sm text-outer-space">
            Mostrando {filteredProjects.length} de {projects.length} proyectos
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEditProject()}
            canDelete={canDeleteProject()}
            userRole={user?.role}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <Folder size={48} className="mx-auto text-outer-space mb-4" />
          <p className="text-outer-space text-lg mb-2">
            {projects.length === 0 ? 
              (user?.role === 'gerente' ? 'No hay proyectos creados' : 'No tienes acceso a proyectos') : 
              'No hay proyectos que coincidan con los filtros'
            }
          </p>
          <p className="text-outer-space text-sm">
            {projects.length === 0 ? 
              (user?.role === 'gerente' ? 'Crea tu primer proyecto para comenzar' : 'El gerente te asignará tareas en proyectos pronto') : 
              'Ajusta los filtros para ver más proyectos'
            }
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSave}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}