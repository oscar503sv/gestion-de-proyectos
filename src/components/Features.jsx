import Card from '@/components/ui/Card';

export default function Features() {
  const features = [
    {
      icon: '📊',
      title: 'Dashboard Inteligente',
      description: 'Visualiza el progreso de tus proyectos y tareas en tiempo real con estadísticas personalizadas según tu rol.'
    },
    {
      icon: '👥',
      title: 'Gestión de Equipos',
      description: 'Administra usuarios, asigna roles y controla el acceso con un sistema de permisos robusto y flexible.'
    },
    {
      icon: '📁',
      title: 'Proyectos Organizados',
      description: 'Crea, edita y gestiona proyectos con fechas límite, estados y seguimiento completo del ciclo de vida.'
    },
    {
      icon: '✅',
      title: 'Seguimiento de Tareas',
      description: 'Asigna tareas, establece prioridades y mantén el control total sobre el progreso del trabajo.'
    },
    {
      icon: '🔒',
      title: 'Control de Acceso',
      description: 'Sistema de roles diferenciado: gerentes con control total y usuarios con acceso a sus asignaciones.'
    },
    {
      icon: '📈',
      title: 'Reportes y Análisis',
      description: 'Obtén estadísticas sobre el rendimiento de proyectos y deadlines críticos.'
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gunmetal mb-4">
            Funcionalidades Principales
          </h2>
          <p className="text-xl text-outer-space max-w-2xl mx-auto">
            Todo lo que necesitas para gestionar proyectos de manera profesional y eficiente
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:scale-105">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gunmetal mb-3">
                {feature.title}
              </h3>
              <p className="text-outer-space leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
