# JS_coursera Todo Example

Esta versión muestra una aplicación de **lista de tareas** más completa escrita con HTML, CSS y JavaScript.
Ahora incluye un pequeño backend en PHP que almacena las tareas en MySQL.
La página funciona tanto en escritorio como en móviles.

## Archivos
- `todo.html` – Estructura de la interfaz.
- `style.css` – Estilos con Flexbox y modo oscuro.
- `script.js` – Lógica para agregar, editar, filtrar y ordenar tareas.
- Carpeta `backend/` – Scripts PHP y esquema SQL para almacenar tareas.

Cada tarea debe registrar obligatoriamente el responsable, la prioridad y la fecha promesa. Al completarla se guarda automáticamente la fecha de cierre. En la parte superior se muestran dos gráficas con el estado y la prioridad de todas las tareas.

## Uso
Abre `todo.html` en tu navegador. Podrás:

- Crear tareas y asignarles categoría.
- Marcar como completadas, editar o eliminar de forma individual o todas a la vez.
- Deshacer la última acción.
- Filtrar por estado o buscar por texto.
- Ordenar por fecha, nombre o estado.
- Alternar entre modo claro y oscuro.
- Ver contadores de tareas totales, completadas y pendientes.
- Registrar responsable, importancia, prioridad y fecha promesa para cada tarea.
- Al completar una tarea se guarda la fecha de cierre y se muestra junto a la promesa.
- Colorear las tareas segun si estan vencidas, proximas o en tiempo.
- Visualizar graficas de pastel con el estado y la prioridad de las tareas.

 Las tareas se cargan automáticamente desde el servidor cada vez que abras la página.
 Para ver las gráficas es necesario que la página pueda cargar **Chart.js** desde
 Internet. Si no hay conexión, la aplicación seguirá funcionando pero las
 gráficas no se mostrarán.

### Backend PHP

1. Crea una base de datos MySQL vacía e importa `backend/schema.sql`.
2. Ajusta las credenciales en `backend/config.php`.
3. Ejecuta un servidor PHP dentro de la carpeta `backend`:
   `php -S localhost:8000`.
4. Abre `todo.html` y asegúrate de que el navegador pueda acceder a `http://localhost:8000/tasks.php`.
