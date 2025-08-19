import { useEffect } from 'react';

/**
 * Hook para cambiar el título de la página dinámicamente
 * @param {string} title - El título que se mostrará en la pestaña
 * @param {string} [suffix] - Sufijo opcional (por defecto "Dr. Shopper")
 */
const usePageTitle = (title, suffix = 'Dr. Shopper') => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${suffix}` : suffix;
    document.title = fullTitle;
    
    // Restaurar el título original cuando el componente se desmonte
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
};

export default usePageTitle;
