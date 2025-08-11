import React, { ReactNode } from 'react';
import { useScrollAnimation, ScrollAnimationOptions } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  duration?: number;
  options?: ScrollAnimationOptions;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 800,
  options
}) => {
  const { elementRef, isVisible } = useScrollAnimation(options);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-out`;
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeUp':
          return `${baseClasses} opacity-0 translate-y-8`;
        case 'fadeIn':
          return `${baseClasses} opacity-0`;
        case 'slideLeft':
          return `${baseClasses} opacity-0 -translate-x-8`;
        case 'slideRight':
          return `${baseClasses} opacity-0 translate-x-8`;
        case 'scale':
          return `${baseClasses} opacity-0 scale-95`;
        default:
          return `${baseClasses} opacity-0 translate-y-8`;
      }
    } else {
      return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {children}
    </div>
  );
};