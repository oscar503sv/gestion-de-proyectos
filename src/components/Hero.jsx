import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="text-center py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gunmetal mb-6">
          Gestión de Proyectos
          <span className="block text-steel-blue text-4xl md:text-5xl mt-2">
            Inteligente y Eficaz
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-outer-space mb-8 max-w-2xl mx-auto leading-relaxed">
          Organiza, colabora y alcanza tus objetivos con nuestra plataforma diseñada 
          para equipos que buscan la excelencia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            href="/login" 
            variant="primary" 
            size="lg"
            className="w-full sm:w-auto"
          >
            Iniciar Sesión
          </Button>
          <Button 
            href="/register" 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto"
          >
            Registrarse
          </Button>
        </div>
      </div>
    </section>
  );
}
