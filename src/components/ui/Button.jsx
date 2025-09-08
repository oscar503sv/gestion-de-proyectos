'use client';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  href,
  className = '',
  ...props 
}) {
  // Variantes de estilo
  const variants = {
    primary: 'bg-steel-blue hover:bg-outer-space text-white',
    secondary: 'bg-ice-blue hover:bg-mint-green text-gunmetal',
    outline: 'border-2 border-steel-blue text-steel-blue hover:bg-outer-space hover:text-white'
  };

  // Tamaños
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-steel-blue focus:ring-opacity-50';
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  // Si es un enlace
  if (href) {
    return (
      <a 
        href={href}
        className={buttonClasses}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Si es un botón
  return (
    <button 
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}
