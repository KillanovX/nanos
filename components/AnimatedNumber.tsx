'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform, animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

export default function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return format ? format(latest) : Math.round(latest).toString();
  });
  
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const animation = animate(count, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
    });

    return animation.stop;
  }, [value, count]);

  useEffect(() => {
    return rounded.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = latest;
      }
    });
  }, [rounded]);

  return <span ref={ref} className={className}>{format ? format(0) : '0'}</span>;
}
