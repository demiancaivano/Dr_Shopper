import { useEffect, useState } from 'react';

// Breakpoints de Tailwind por defecto
const breakpoints = {
  '2xl': 1536,
  'xl': 1280,
  'lg': 1024,
  'md': 768,
  'sm': 640,
};

function getBreakpoint(width) {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints['xl']) return 'xl';
  if (width >= breakpoints['lg']) return 'lg';
  if (width >= breakpoints['md']) return 'md';
  if (width >= breakpoints['sm']) return 'sm';
  return 'xs';
}

export default function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() => getBreakpoint(window.innerWidth));

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
} 