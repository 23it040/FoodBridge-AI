import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [], className = '' }) => (
  <nav aria-label="Breadcrumb" className={`text-sm text-[#626760] ${className}`}>
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-[#E6DED6]">/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-[#BD715C] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#292B29] font-semibold">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumb;
