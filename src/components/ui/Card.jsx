export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-ice-blue p-6 transition-all duration-200 hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
