import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ComponentType<LucideProps>;
  className?: string;
}

export default function FeatureCard({ title, description, icon: Icon, className = '' }: FeatureCardProps) {
  return (
    <div className={`group bg-white border-2 border-zinc-900 p-8 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] ${className}`}>
      <div className="mb-6 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-zinc-50 text-zinc-900 transition-colors group-hover:bg-zinc-900 group-hover:text-white">
        <Icon className="h-6 w-6" strokeWidth={2.5} />
      </div>
      <h4 className="mb-2 font-sans text-lg font-bold uppercase tracking-tight text-zinc-900">{title}</h4>
      <p className="text-sm font-medium leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}
