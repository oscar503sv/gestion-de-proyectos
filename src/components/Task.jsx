/*export default function Task({butonCrear,titulo,descripcion,prioridad,encargado,fechaRegistro,fechaFinalizacion,fechaModificacion,estatus,butonguardar}){
    
    let estilo="text-3xl font-bold text-green-600"
    if (prioridad=='Alta'){
        estilo="text-3xl font-bold text-red-255"
    }
    if (prioridad=="Intermedia"){
        estilo="text-3xl font-bold text-orange-500"
    }
    return (
            <>

   <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gunmetal mb-2">
                {titulo}
              </h3>
              <p className={estilo}>
                {descripcion}
              </p>
              <p>{butonCrear}</p>
              <p> {butonguardar}</p>
              <p> {encargado}</p>
              <p> {fechaRegistro}</p>
              <p> {fechaModificacion}</p>
              <p> {fechaFinalizacion}</p>
              <p> {estatus}</p>
     </div>
     </>)
        
}*/

import { Check, Pencil, X } from "lucide-react";



export default function Task({
  titulo,
  descripcion,
  prioridad,
  encargado,
  fechaRegistro,
  fechaFinalizacion,
  fechaModificacion,
  estatus,
  onEdit,
  onComplete,
  onDelete,
  proyectoId
}) {
  // 🎨 Colores dinámicos por prioridad
  const priorityColors = {
    Alta: "bg-red-100 text-red-700 border-red-400",
    Intermedia: "bg-yellow-100 text-yellow-700 border-yellow-400",
    Baja: "bg-green-100 text-green-700 border-green-400",
  };
  const proyectos = {
    sdi: "Sistema de Inventario",
    dsw: "Desarrollo de Sitio Web",
    mac: "Migración a la nube",
    am: "App Móvil",
  };
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border p-6 flex flex-col justify-between h-full">
      {/* Título */}

      <div className="flex justify-between items-start mb-3">


        <div className="mb-2">
          <p className="text-sm text-gray-400">
            Usuario-Autor: <span className="font-semibold">{encargado}</span>
          </p>

          <h3 className="text-lg md:text-xl font-bold text-gray-800 break-words whitespace-normal">
            {titulo}
          </h3>
        </div>


        {/* Badge de prioridad */}
        <span
          className={`px-3 py-1 text-xs md:text-sm rounded-full border ${priorityColors[prioridad]}`}
        >
          {prioridad}
        </span>
      </div>

      {/* Descripción */}
      <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
        {descripcion}
      </p>


    
      {/* Info extra */}
      <div className="text-xs md:text-sm text-gray-500 space-y-1 mb-4">
        {encargado && <p><span className="font-semibold">Encargado:</span> {encargado}</p>}
        {fechaRegistro && <p><span className="font-semibold">Registrado:</span> {fechaRegistro}</p>}
        {fechaModificacion && <p><span className="font-semibold">Última modificación:</span> {fechaModificacion}</p>}
        {fechaFinalizacion && (
          <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full">
            Finalizada: {fechaFinalizacion}
          </span>
        )}
     

      </div>
     {proyectoId && (
        <p className="text-sm text-gray-500">
          Proyecto: <span className="font-semibold">{proyectos[proyectoId]}</span>
        </p>
      )}
      {/* Footer */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t">
        {/* Estatus */}
        <div className="flex items-center gap-2">
          {estatus === "Completada" ? (
            <span className="flex items-center gap-1 text-green-600 font-semibold text-sm md:text-base">
              <Check className="w-5 h-5" /> Completada
            </span>
          ) : (
            <span className="text-black-500 text-sm md:text-base">Pendiente</span>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          {estatus !== "Completada" && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white flex items-center gap-1 shadow-sm"
            >
              <Pencil size={14} /> Editar
            </button>
          )}

          {estatus !== "Completada" && (
            <button
              onClick={onComplete}
              className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white shadow-sm"
            >
              Finalizar
            </button>
          )}

          <button
            onClick={onDelete}
            className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
          >
            <X size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}


