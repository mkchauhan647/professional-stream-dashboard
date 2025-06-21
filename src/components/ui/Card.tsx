import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`
      bg-dark/60 rounded-2xl p-6 shadow-2xl transition-transform duration-300 ease-in-out
      border border-gray-light backdrop-blur-lg hover:translate-y-[-5px]
      ${className}
    `}>
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-light">
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className="text-2xl bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text"
          />
        )}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}