

import React, { useState, useEffect } from "react";

export default function TaskForm({ visible, save, onClose, task, user ,editingTask}) {

 const proyectos = [
    { id: "sdi", nombre: "Sistema de Inventario" },
    { id: "dssw", nombre: "Desarrollo de Sitio Web" },
    { id: "mac", nombre: "Migración a la nube" },
    { id: "am", nombre: "App Móvil" },
  ];

  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Baja");
  const [title, setTitle] = useState(task?.titulo || "");
  const [proyecto, setProyecto] = useState(proyectos[0].id);



 




  // 🔑 Cuando llega un task para editar, llenamos los campos
  useEffect(() => {
    if (task) {
      setTitle(task.titulo || "");
      setDescription(task.descripcion || "");
      setPriority(task.prioridad || "Baja");
    }
  }, [task]);

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedTask = {
      ...task, // si existe lo conserva (incluye id y estatus)
      id: task?.id || Date.now(),
      titulo: title.trim(),
      descripcion: description.trim(),
      prioridad: priority,
      fechaRegistro: task?.fechaRegistro || new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      fechaModificacion: task ? new Date().toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }) : null,
      encargado: user?.name || "Usuario desconocido",
       proyectoId: proyecto
    };

    if (typeof save === "function") save(updatedTask);

    // limpiar
    setTitle("");
    setDescription("");
    setPriority("Baja");

    if (typeof onClose === "function") onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl w-full mx-auto p-4 bg-white rounded-2xl shadow-md relative"
      >
        <h2 className="text-xl font-semibold mb-4">
          {task ? "Editar tarea" : "Registrar nueva tarea"}
        </h2>

        <label className="block mb-3">
          <span className="text-sm font-medium">Título</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!!task}   // 🔑 si existe task (edición), se desactiva
            className={`w-full p-2 border rounded-md ${task ? "bg-gray-200 cursor-not-allowed" : ""
              }`}
            required
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">Descripción</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Descripción breve de la tarea"
            className="mt-1 block w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium">Prioridad</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="mt-1 block w-48 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            <option value="Baja">Baja</option>
            <option value="Intermedia">Intermedia</option>
            <option value="Alta">Alta</option>
          </select>
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium">Proyecto</span>
          <select
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            disabled={!!editingTask} // ❌ deshabilitado si estamos editando
            className="mt-1 block w-48 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-1"
          >
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>


        <div className="flex justify-between items-center mt-4">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md focus:outline-none bg-blue-500 text-white"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}


