import React from 'react';
import usePageTitle from '../hooks/usePageTitle';

const NotFound = () => {
  // Cambiar el título de la página
  usePageTitle('Page Not Found');
  return (
    <div className="not-found">
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe</p>
    </div>
  );
};

export default NotFound; 