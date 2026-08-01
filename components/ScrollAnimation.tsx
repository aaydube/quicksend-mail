'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-down' | 'zoom-in' | 'slide-right';
  delay?: number;
}

export default function ScrollAnimation({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getAnimationStyles = () => {
    switch (animation) {
      case 'fade-up':
        return inView
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-12 scale-[0.97]';
      case 'fade-down':
        return inView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-8';
      case 'zoom-in':
        return inView
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-90';
      case 'slide-right':
        return inView
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-8';
      default:
        return inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) transform ${getAnimationStyles()} ${className}`}
    >
      {children}
    </div>
  );
}
