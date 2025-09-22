import { useState, useEffect } from 'react';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todas las tareas (filtradas por rol en el servidor)
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return;
      }
      
      const url = `/api/tasks?requestedBy=${user.id}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        // La API devuelve data.data, no data.tasks
        const freshTasks = data.data || [];
        setTasks(freshTasks);
        setError(null); // Limpiar errores previos
        
        // Limpiar localStorage si es necesario para evitar datos obsoletos
        if (freshTasks.length === 0) {
          localStorage.removeItem('cachedTasks');
        }
      } else {
        setError(data.message || 'Error al cargar tareas');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Crear nueva tarea
  const createTask = async (taskData) => {
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return false;
      }

      // Convertir y preparar los datos de la tarea
      const taskWithRequestedBy = {
        ...taskData,
        requestedBy: user.id,
        projectId: parseInt(taskData.projectId), // Convertir a número
        assignedTo: parseInt(taskData.assignedTo), // Convertir a número
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null // Convertir a ISO string
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithRequestedBy)
      });
      const data = await response.json();
      if (data.success) {
        await fetchTasks(); // Recargar lista
        setError(null);
        return true;
      } else {
        setError(data.message || data.errors?.join(', ') || 'Error al crear tarea');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    }
  };

  // Actualizar tarea
  const updateTask = async (id, taskData) => {
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return false;
      }

      // Preparar los datos según el rol del usuario
      let processedTaskData = { 
        requestedBy: user.id
      };
      
      if (user.role === 'gerente') {
        // Gerentes pueden enviar todos los campos
        processedTaskData = { 
          ...taskData,
          requestedBy: user.id
        };
        
        // Convertir tipos de datos si están presentes
        if (processedTaskData.projectId) {
          processedTaskData.projectId = parseInt(processedTaskData.projectId);
        }
        if (processedTaskData.assignedTo) {
          processedTaskData.assignedTo = parseInt(processedTaskData.assignedTo);
        }
        if (processedTaskData.dueDate) {
          processedTaskData.dueDate = new Date(processedTaskData.dueDate).toISOString();
        }
      } else if (user.role === 'usuario') {
        // Usuarios solo pueden enviar el status
        processedTaskData = {
          requestedBy: user.id,
          status: taskData.status
        };
      }

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedTaskData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const updatedTask = responseData.data; // La tarea está en responseData.data
        setTasks(tasks.map(task => 
          task.id === id ? updatedTask : task
        ));
        setError(null);
        return true; // Devolver booleano como espera el componente
      } else {
        const data = await response.json();
        // Si la tarea no existe, recargar la lista automáticamente
        if (data.message && data.message.includes('no encontrada')) {
          await fetchTasks();
          setError('La tarea ya no existe. Se ha actualizado la lista.');
        } else {
          setError(data.message || data.errors?.join(', ') || 'Error al actualizar tarea');
        }
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    }
  };

  // Eliminar tarea
  const deleteTask = async (id) => {
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return false;
      }

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedBy: user.id }) // Enviar requestedBy requerido por la API
      });
      const data = await response.json();
      if (data.success) {
        await fetchTasks(); // Recargar lista
        setError(null);
        return true;
      } else {
        setError(data.message || data.errors?.join(', ') || 'Error al eliminar tarea');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
}