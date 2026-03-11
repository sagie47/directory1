import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  to?: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="bg-white border-b border-zinc-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-[10px] font-mono tracking-[0.1em] text-zinc-400 overflow-x-auto whitespace-nowrap uppercase">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center">
              {item.to ? (
                <Link to={item.to} className="hover:text-zinc-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-zinc-900 font-medium">{item.label}</span>
              )}
              {index < items.length - 1 && <span className="mx-2 text-zinc-300">/</span>}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
