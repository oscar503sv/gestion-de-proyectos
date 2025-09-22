import { useState } from 'react';
import { 
  Pencil, 
  Trash2, 
  Calendar, 
  User, 
  CheckCircle2, 
  PlayCircle, 
  Pause, 
  AlertTriangle,
  Folder,
  Users
} from 'lucide-react';

const statusConfig = {
  pendiente: {
    color: 'bg-outer-space text-white',
    icon: Pause,
    label: 'Pendiente'
  },
  'en progreso': {
    color: 'bg-steel-blue text-white',
    icon: PlayCircle,
    label: 'En Progreso'
  },
  completado: {
    color: 'bg-ice-blue text-gunmetal',
    icon: CheckCircle2,
    label: 'Completado'
  }
};

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete, 
  canEdit = false, 
  canDelete = false,
  userRole 
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!canDelete) {
      alert('No tienes permisos para eliminar este proyecto');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar este proyecto? Esta acción no se puede deshacer.')) {
      setDeleting(true);
      await onDelete(project.id);
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!canEdit) {
      alert('No tienes permisos para editar este proyecto');
      return;
    }
    onEdit(project);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completado';
  const StatusIcon = statusConfig[project.status]?.icon || Pause;

  // Calcular progreso de tareas
  const totalTasks = project.totalTasks || 0;
  const completedTasks = project.completedTasks || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-shadow hover:shadow-lg ${isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-steel-blue'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Folder size={24} className="text-steel-blue mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-gunmetal text-xl leading-tight mb-1">
              {project.name}
            </h3>
            <p className="text-outer-space text-sm line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
        <div className="flex gap-1 ml-3">
          {canEdit && (
            <button
              onClick={handleEdit}
              className="p-2 text-steel-blue hover:bg-mint-green rounded-md transition-colors"
              title="Editar proyecto"
            >
              <Pencil size={18} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Eliminar proyecto"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig[project.status]?.color}`}>
          <StatusIcon size={16} />
          {statusConfig[project.status]?.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gunmetal">Progreso</span>
          <span className="text-sm text-outer-space">
            {completedTasks}/{totalTasks} tareas ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-steel-blue h-3 rounded-full transition-all duration-300" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Project Info */}
      <div className="space-y-3">
        {/* Created By */}
        <div className="flex items-center gap-2 text-sm text-outer-space">
          <User size={16} className="flex-shrink-0" />
          <span className="truncate">
            Creado por: {project.createdByUser?.name || 'Usuario desconocido'}
          </span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className={`flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-outer-space'}`} />
          <span className={`${isOverdue ? 'text-red-500 font-medium' : 'text-outer-space'}`}>
            {isOverdue && <AlertTriangle size={14} className="inline mr-1" />}
            Fecha límite: {formatDate(project.deadline)}
          </span>
        </div>

        {/* Team Size */}
        {project.teamSize && (
          <div className="flex items-center gap-2 text-sm text-outer-space">
            <Users size={16} className="flex-shrink-0" />
            <span>
              {project.teamSize} {project.teamSize === 1 ? 'miembro' : 'miembros'} del equipo
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-outer-space">
          Creado el {formatDate(project.createdAt)}
        </p>
      </div>
    </div>
  );
}