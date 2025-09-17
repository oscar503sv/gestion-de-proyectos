// se agrega nueva funcionalidad de buscador en componentes
// y se ejecuta en el dashboard/page.jsx
// no se hicieron mas cambios en la raiz del codigo

'use client';
import { useState } from 'react';
import Link from 'next/link';

// son datos de ejemplo para el buscador, aca pueden ir los titulos y rutas reales
// si se selecciona uno de los resultados, se limpia el input del buscador
// y se navega a la ruta correspondiente si existieran en la app
// caso contrario si se selecciona se ira a una pagina que no existe aun

let contenidoBuscable = [
  { title: 'Pagina Principal', path: '/' },
  { title: 'Iniciar Sesion', path: '/login' },
  { title: 'Crear una Cuenta', path: '/register' },
  { title: 'Proyecto: Desarrollo de Sitio Web', path: '/projects/1' }, 
  { title: 'Proyecto: App Movil', path: '/projects/2' }, 
  { title: 'Tarea: Diseñar interfaz', path: '/tasks/1' } 
];

export default function SearchBar() {
  
  const [busqueda, setBusqueda] = useState('');

  let resultados = busqueda.length > 1

    ? contenidoBuscable.filter(item =>

        item.title.toLowerCase().includes(busqueda.toLowerCase())
      )

    : []; 
  
  let limpiarBuscador = () => {

      setBusqueda('');

  }

  return (
    
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)} 
        placeholder="Buscar..."
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue"
      />

      {}

      {resultados.length > 0 && (

        <ul className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {resultados.map((item, index) => (
            <li key={index} className="border-b last:border-b-0">
              <Link
                href={item.path}
                onClick={limpiarBuscador}
                className="block px-4 py-2 text-gunmetal hover:bg-gray-100"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}