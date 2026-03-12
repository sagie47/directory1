import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureCardProps {
  key?: string;
  title: string | ReactNode;
  description: string;
  icon: ComponentType<LucideProps>;
  className?: string;
  tone?: 'default' | 'soft' | 'solid';
  index?: number;
}

export default function FeatureCard({ title, description, icon: Icon, className = '', tone = 'default', index = 0 }: FeatureCardProps) {
  const tones = {
    default: "bg-white border-zinc-200 shadow-sm",
    soft: "bg-zinc-50/50 border-zinc-100 shadow-sm backdrop-blur-sm",
    solid: "bg-zinc-900 text-white border-zinc-800 shadow-xl"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`group border rounded-sm p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-8 lg:p-10 ${tones[tone]} ${className}`}
    >
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-sm border transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 sm:mb-8 sm:h-14 sm:w-14 ${tone === 'solid' ? 'bg-white/10 border-white/20 text-white group-hover:bg-orange-500 group-hover:border-orange-500' : 'bg-white border-zinc-200 text-zinc-400 group-hover:text-orange-600 group-hover:border-orange-200 group-hover:shadow-md group-hover:shadow-orange-500/10'}`}>
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
      </div>
      <h4 className="mb-3 font-sans text-lg font-bold uppercase tracking-tight leading-tight sm:mb-4 sm:text-xl">{title}</h4>
      <p className={`text-[15px] font-medium leading-relaxed sm:text-base ${tone === 'solid' ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
    </motion.div>
  );
}
