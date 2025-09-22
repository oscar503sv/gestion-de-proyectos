import { useState } from 'react';
import { 
  Pencil, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle2, 
  PlayCircle, 
  Pause, 
  AlertTriangle, 
  Flag,
  Folder
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
    label: 'Completada'
  }
};

const priorityConfig = {
  baja: {
    border: 'border-l-ice-blue',
    color: 'text-ice-blue',
    label: 'Baja'
  },
  media: {
    border: 'border-l-steel-blue',
    color: 'text-steel-blue',
    label: 'Media'
  },
  alta: {
    border: 'border-l-red-500',
    color: 'text-red-500',
    label: 'Alta'
  }
};

export default function TaskCard({ task, onEdit, onDelete, canEdit = false, canDelete = false, userRole }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!canDelete) {
      alert('No tienes permisos para eliminar esta tarea');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      setDeleting(true);
      await onDelete(task.id);
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!canEdit) {
      alert('No tienes permisos para editar esta tarea');
      return;
    }
    onEdit(task);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completado';
  const StatusIcon = statusConfig[task.status]?.icon || Pause;

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 transition-shadow hover:shadow-lg ${priorityConfig[task.priority]?.border} ${isOverdue ? 'bg-red-50 border-red-300' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-2 flex-1">
          <Folder size={18} className="text-outer-space mt-0.5 flex-shrink-0" />
          <h3 className="font-semibold text-gunmetal text-lg leading-tight">{task.title}</h3>
        </div>
        <div className="flex gap-1 ml-2">
          {canEdit && (
            <button
              onClick={handleEdit}
              className="p-1.5 text-steel-blue hover:bg-mint-green rounded-md transition-colors"
              title="Editar tarea"
            >
              <Pencil size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              title="Eliminar tarea"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-outer-space text-sm mb-3 line-clamp-2 leading-relaxed">{task.description}</p>

      {/* Status Badge */}
      <div className="mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig[task.status]?.color}`}>
          <StatusIcon size={12} />
          {statusConfig[task.status]?.label}
        </span>
      </div>

      {/* Footer Info */}
      <div className="space-y-2">
        {/* Assigned User */}
        <div className="flex items-center gap-2 text-xs text-outer-space">
          <User size={14} className="flex-shrink-0" />
          <span className="truncate">{task.assignedToUser?.name || 'Sin asignar'}</span>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-2 text-xs">
          <Clock size={14} className={`flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-outer-space'}`} />
          <span className={`${isOverdue ? 'text-red-500 font-medium' : 'text-outer-space'}`}>
            {isOverdue && <AlertTriangle size={12} className="inline mr-1" />}
            {formatDate(task.dueDate)}
          </span>
        </div>

        {/* Priority */}
        <div className="flex items-center gap-2 text-xs">
          <Flag size={14} className={`flex-shrink-0 ${priorityConfig[task.priority]?.color}`} />
          <span className="text-outer-space">Prioridad: </span>
          <span className={`font-medium ${priorityConfig[task.priority]?.color}`}>
            {priorityConfig[task.priority]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}