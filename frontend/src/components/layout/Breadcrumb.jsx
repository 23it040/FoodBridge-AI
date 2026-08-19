import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [], className = '' }) => (
  <nav aria-label="Breadcrumb" className={`text-sm text-slate-500 dark:text-slate-400 ${className}`}>
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-secondary dark:hover:text-cyan-300">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700 dark:text-slate-100">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;
