import { useState, useEffect } from 'react';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener todos los proyectos
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return;
      }
      
      const url = `/api/projects?requestedBy=${user.id}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const freshProjects = data.data || [];
        setProjects(freshProjects);
        setError(null);
      } else {
        setError(data.message || 'Error al cargar proyectos');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo proyecto
  const createProject = async (projectData) => {
    try {
      // Obtener datos del usuario para enviar createdBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return false;
      }

      // Solo gerentes pueden crear proyectos
      if (user.role !== 'gerente') {
        setError('Solo los gerentes pueden crear proyectos');
        return false;
      }

      // Preparar los datos del proyecto
      const projectWithCreatedBy = {
        ...projectData,
        createdBy: user.id,
        deadline: projectData.deadline ? new Date(projectData.deadline).toISOString().split('T')[0] : null
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectWithCreatedBy)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchProjects(); // Recargar lista
        setError(null);
        return true;
      } else {
        setError(data.message || data.errors?.join(', ') || 'Error al crear proyecto');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    }
  };

  // Actualizar proyecto
  const updateProject = async (id, projectData) => {
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return false;
      }

      // Solo gerentes pueden actualizar proyectos
      if (user.role !== 'gerente') {
        setError('Solo los gerentes pueden actualizar proyectos');
        return false;
      }

      // Preparar los datos del proyecto
      const projectWithRequestedBy = {
        ...projectData,
        requestedBy: user.id,
        deadline: projectData.deadline ? new Date(projectData.deadline).toISOString().split('T')[0] : null
      };

      const response = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectWithRequestedBy)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const updatedProject = responseData.data;
        setProjects(projects.map(project => 
          project.id === id ? updatedProject : project
        ));
        setError(null);
        return true;
      } else {
        const data = await response.json();
        setError(data.message || data.errors?.join(', ') || 'Error al actualizar proyecto');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    }
  };

  // Eliminar proyecto
  const deleteProject = async (id) => {
    try {
      // Obtener datos del usuario para enviar requestedBy
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setError('No hay usuario logueado');
        return false;
      }

      // Solo gerentes pueden eliminar proyectos
      if (user.role !== 'gerente') {
        setError('Solo los gerentes pueden eliminar proyectos');
        return false;
      }

      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedBy: user.id })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchProjects(); // Recargar lista
        setError(null);
        return true;
      } else {
        setError(data.message || data.errors?.join(', ') || 'Error al eliminar proyecto');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      return false;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
}