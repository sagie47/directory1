import { type ComponentType, type ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

interface SectionEyebrowProps {
  children: ReactNode;
  icon?: ComponentType<LucideProps>;
  className?: string;
  iconClassName?: string;
}

export default function SectionEyebrow({
  children,
  icon: Icon,
  className = '',
  iconClassName = '',
}: SectionEyebrowProps) {
  return (
    <div className={className}>
      {Icon ? <Icon className={iconClassName} /> : null}
      {children}
    </div>
  );
}
