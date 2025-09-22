'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

export default function SearchBar({ 
  data = [], 
  searchFields = ['title', 'name'], 
  onSelect, 
  placeholder = "Buscar...",
  showCategories = false,
  disabled = false 
}) {
  const [busqueda, setBusqueda] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const containerRef = useRef(null);

  // Función para obtener valor de campo anidado
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((curr, prop) => curr?.[prop], obj);
  };

  // Filtrar resultados basado en los campos de búsqueda
  const resultados = busqueda.length > 1 
    ? data.filter(item => 
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(busqueda.toLowerCase());
        })
      ).slice(0, 8) // Limitar a 8 resultados
    : [];

  // Limpiar búsqueda
  const limpiarBuscador = () => {
    setBusqueda('');
    setIsOpen(false);
  };

  // Manejar selección de item
  const handleSelect = (item) => {
    if (onSelect) {
      onSelect(item);
    }
    limpiarBuscador();
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar teclas (Escape para cerrar, Enter para seleccionar primer resultado)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      limpiarBuscador();
    } else if (e.key === 'Enter' && resultados.length > 0) {
      e.preventDefault();
      handleSelect(resultados[0]);
    }
  };

  // Abrir dropdown cuando hay texto
  useEffect(() => {
    setIsOpen(busqueda.length > 1 && resultados.length > 0);
  }, [busqueda, resultados.length]);

  // Determinar el tipo de item para mostrar icono y formato apropiado
  const getItemDisplay = (item) => {
    if (item.title) {
      // Es una tarea
      return {
        title: item.title,
        subtitle: item.description,
        category: 'Tarea',
        path: `/dashboard/tareas`,
        categoryColor: 'text-steel-blue'
      };
    } else if (item.name) {
      // Es un proyecto
      return {
        title: item.name,
        subtitle: item.description,
        category: 'Proyecto',
        path: `/dashboard/projects`,
        categoryColor: 'text-ice-blue'
      };
    } else if (item.email) {
      // Es un usuario
      return {
        title: item.name,
        subtitle: item.email,
        category: 'Usuario',
        path: `/dashboard/usuarios`,
        categoryColor: 'text-outer-space'
      };
    }
    
    // Fallback genérico
    return {
      title: item.title || item.name || 'Item',
      subtitle: item.description || '',
      category: 'Resultado',
      path: '#',
      categoryColor: 'text-gunmetal'
    };
  };

  if (disabled) {
    return (
      <div className="relative w-full max-w-xs opacity-50">
        <input
          type="text"
          placeholder={placeholder}
          disabled
          className="w-full px-4 py-2 pl-10 border-2 border-outer-space rounded-lg bg-gray-100 cursor-not-allowed"
        />
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-outer-space" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      {/* Input con icono */}
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border-2 border-outer-space rounded-lg focus:outline-none focus:ring-2 focus:ring-steel-blue focus:border-transparent transition-colors"
        />
        
        {/* Icono de búsqueda */}
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-outer-space" />
        
        {/* Botón para limpiar */}
        {busqueda && (
          <button
            onClick={limpiarBuscador}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-outer-space hover:text-gunmetal transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && resultados.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border border-outer-space rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {resultados.map((item, index) => {
            const display = getItemDisplay(item);
            
            // Crear key única combinando tipo de item con ID
            const uniqueKey = item.title ? `task-${item.id}` : item.name ? `project-${item.id}` : item.email ? `user-${item.id}` : `item-${index}`;
            
            return (
              <div key={uniqueKey} className="border-b border-gray-100 last:border-b-0">
                {onSelect ? (
                  // Si hay función onSelect, es un botón
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 hover:bg-mint-green transition-colors focus:bg-mint-green focus:outline-none"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gunmetal truncate">
                            {display.title}
                          </h4>
                          {showCategories && (
                            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${display.categoryColor}`}>
                              {display.category}
                            </span>
                          )}
                        </div>
                        {display.subtitle && (
                          <p className="text-sm text-outer-space truncate">
                            {display.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ) : (
                  // Si no hay función onSelect, es un link
                  <Link
                    href={display.path}
                    onClick={limpiarBuscador}
                    className="block px-4 py-3 text-gunmetal hover:bg-mint-green transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gunmetal truncate">
                            {display.title}
                          </h4>
                          {showCategories && (
                            <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${display.categoryColor}`}>
                              {display.category}
                            </span>
                          )}
                        </div>
                        {display.subtitle && (
                          <p className="text-sm text-outer-space truncate">
                            {display.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
          
          {/* Footer con contador */}
          <div className="px-4 py-2 bg-gray-50 text-xs text-outer-space text-center">
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            {data.length > resultados.length && ` de ${data.length} total`}
          </div>
        </div>
      )}
    </div>
  );
}