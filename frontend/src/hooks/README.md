# Hooks

Este directorio contiene hooks personalizados de React utilizados en la aplicación.

## usePageTitle

Hook personalizado para cambiar dinámicamente el título de la página en la pestaña del navegador.

### Uso

```jsx
import usePageTitle from '../hooks/usePageTitle';

const MyComponent = () => {
  // Cambiar el título de la página
  usePageTitle('Mi Página');
  
  return <div>...</div>;
};
```

### Parámetros

- `title` (string): El título que se mostrará en la pestaña
- `suffix` (string, opcional): Sufijo opcional (por defecto "Dr. Shopper")

### Ejemplo de salida

- Con título: "Mi Página | Dr. Shopper"
- Sin título: "Dr. Shopper"

### Características

- Cambia automáticamente el título cuando el componente se monta
- Restaura el título original cuando el componente se desmonta
- Formato consistente: "Título | Dr. Shopper"

## useBreakpoint

Hook para detectar el breakpoint actual de la pantalla.

### Uso

```jsx
import useBreakpoint from '../hooks/useBreakpoint';

const MyComponent = () => {
  const breakpoint = useBreakpoint();
  
  if (breakpoint === 'xs') {
    return <div>Mobile view</div>;
  }
  
  return <div>Desktop view</div>;
};
```

### Breakpoints disponibles

- `xs`: < 640px
- `sm`: 640px - 767px
- `md`: 768px - 1023px
- `lg`: 1024px - 1279px
- `xl`: ≥ 1280px

## useApi

Hook para manejar llamadas a la API con estados de carga y error.

### Uso

```jsx
import useApi from '../hooks/useApi';

const MyComponent = () => {
  const { data, loading, error, execute } = useApi();
  
  const fetchData = () => {
    execute('/api/endpoint');
  };
  
  return (
    <div>
      {loading && <div>Cargando...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{JSON.stringify(data)}</div>}
      <button onClick={fetchData}>Cargar datos</button>
    </div>
  );
};
``` 