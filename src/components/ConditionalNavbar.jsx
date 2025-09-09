'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Rutas donde NO queremos mostrar la navbar
  const hiddenNavbarRoutes = ['/dashboard', '/login', '/register'];
  
  // Verificar si la ruta actual está en la lista de rutas ocultas
  const shouldHideNavbar = hiddenNavbarRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Si debe ocultarse, no renderizar nada
  if (shouldHideNavbar) {
    return null;
  }
  
  // Si no, mostrar la navbar
  return <Navbar />;
}
