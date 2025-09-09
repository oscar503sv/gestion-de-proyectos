import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Navbar() {
  return (
    <nav className="bg-ice-blue border-b border-outer-space">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gunmetal">
              Gestión de Proyectos
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button size="sm">
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
