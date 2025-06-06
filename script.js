/**
 * script.js - Logica avanzada para la lista de tareas
 * Permite agregar, editar, filtrar y ordenar tareas.
 * Las tareas se almacenan en MySQL mediante un backend PHP.
 * Se mantiene un historial local para deshacer cambios recientes.
*/
// Arreglo con las tareas obtenidas del servidor
let tasks = [];

let undoStack = [];
let currentFilter = 'all';
let sortBy = 'date';
let searchText = '';

// Elementos del DOM
const taskInput = document.getElementById('taskInput');
const categoryInput = document.getElementById('categoryInput');
const responsibleInput = document.getElementById('responsibleInput');
const importanceInput = document.getElementById('importanceInput');
const priorityInput = document.getElementById('priorityInput');
const dueDateInput = document.getElementById('dueDateInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter');
const sortSelect = document.getElementById('sortSelect');
const themeToggle = document.getElementById('themeToggle');
const undoButton = document.getElementById('undoButton');
const clearButton = document.getElementById('clearButton');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');
const statusCtx = document.getElementById('statusChart');
const priorityCtx = document.getElementById('priorityChart');

let statusChart;
let priorityChart;

/** Comunicacion con el backend PHP ------------------------------*/

/** Carga todas las tareas desde el servidor */
async function loadTasks() {
  try {
    const resp = await fetch('backend/tasks.php');
    tasks = await resp.json();
    renderTasks();
  } catch (err) {
    console.error('Error al cargar tareas', err);
  }
}

/** Envía una tarea nueva al servidor */
async function createTask(task) {
  const resp = await fetch('backend/tasks.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  const data = await resp.json();
  task.id = data.id;
}

/** Actualiza una tarea existente */
async function updateTask(task) {
  await fetch('backend/tasks.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
}

/** Elimina una tarea del servidor */
async function deleteTask(id) {
  await fetch(`backend/tasks.php?id=${id}`, { method: 'DELETE' });
}

/** Guarda la preferencia de tema */


/** Guarda la preferencia de tema */
function saveTheme() {
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

/** Crea el elemento visual para una tarea */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.dataset.id = task.id;
  if (task.completed) {
    li.classList.add('completed');
  } else {
    const diff = task.dueDate ? (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24) : Infinity;
    if (diff < 0) li.classList.add('overdue');
    else if (diff <= 2) li.classList.add('due-soon');
    else li.classList.add('on-time');
  }

  const info = document.createElement('span');
  info.className = 'info';
  const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A';
  const closed = task.closedAt ? new Date(task.closedAt).toLocaleDateString() : '';
  info.innerHTML = `<strong>${task.text}</strong> <small>[${task.category || 'General'}]</small> <em>${new Date(task.createdAt).toLocaleString()}</em><br>Resp: ${task.responsible || '-'} | Imp: ${task.importance || '-'} | Pri: ${task.priority || '-'} | Promesa: ${due}${closed ? ' | Cierre: ' + closed : ''}`;

  li.appendChild(info);

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Editar';
  editBtn.addEventListener('click', () => editTask(task.id));

  const completeBtn = document.createElement('button');
  completeBtn.textContent = task.completed ? 'Deshacer' : 'Completar';
  completeBtn.addEventListener('click', () => toggleTask(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.addEventListener('click', () => removeTask(task.id));

  li.append(editBtn, completeBtn, deleteBtn);
  taskList.appendChild(li);
}

/** Muestra las tareas aplicando filtros y orden */
function renderTasks() {
  let filtered = tasks.filter(t => {
    const matchFilter =

      currentFilter === 'all' ||
      (currentFilter === 'completed' && t.completed) ||
      (currentFilter === 'pending' && !t.completed);
    const matchText = t.text.toLowerCase().includes(searchText);
    return matchFilter && matchText;
  });

  filtered.sort((a, b) => {
    if (sortBy === 'name') return a.text.localeCompare(b.text);
    if (sortBy === 'status') return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
    return a.createdAt - b.createdAt; // por fecha
  });

  taskList.innerHTML = '';
  filtered.forEach(createTaskElement);

  totalCount.textContent = `${tasks.length} totales`;
  completedCount.textContent = `${tasks.filter(t => t.completed).length} completadas`;
  pendingCount.textContent = `${tasks.filter(t => !t.completed).length} pendientes`;

  updateCharts();
}

/** Actualiza las graficas de pastel */
function updateCharts() {
  // Si Chart.js no se cargo (por ejemplo falta internet), evitamos errores
  if (!statusCtx || !priorityCtx || typeof Chart === 'undefined') return;


  const now = new Date();
  const overdue = tasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < now).length;
  const dueSoon = tasks.filter(t => !t.completed && t.dueDate && (new Date(t.dueDate) - now) / (1000*60*60*24) <= 2 && (new Date(t.dueDate) - now) >= 0).length;
  const onTime = tasks.filter(t => !t.completed && (!t.dueDate || (new Date(t.dueDate) - now) / (1000*60*60*24) > 2)).length;
  const completed = tasks.filter(t => t.completed).length;

  const priorities = { Alta: 0, Media: 0, Baja: 0 };
  tasks.forEach(t => {
    if (t.priority && priorities[t.priority] !== undefined) {
      priorities[t.priority]++;
    }
  });

  if (statusChart) statusChart.destroy();
  statusChart = new Chart(statusCtx, {
    type: 'pie',
    data: {
      labels: ['Vencidas', 'Pronto', 'En tiempo', 'Completadas'],
      datasets: [{ data: [overdue, dueSoon, onTime, completed], backgroundColor: ['#ff6666', '#ffcc66', '#66cc66', '#6699ff'] }]
    },
    options: { responsive: false }
  });

  if (priorityChart) priorityChart.destroy();
  priorityChart = new Chart(priorityCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(priorities),
      datasets: [{ data: Object.values(priorities), backgroundColor: ['#ff9999','#ffd699','#ffff99'] }]
    },
    options: { responsive: false }
  });
}

/** Agrega una nueva tarea */
async function addTask() {
  const text = taskInput.value.trim();
  const resp = responsibleInput.value.trim();
  const due = dueDateInput.value;
  const pri = priorityInput.value;
  if (!text || !resp || !due || !pri) {
    alert('Por favor ingresa responsable, prioridad y fecha promesa.');
    return;
  }
  const task = {
    text,
    category: categoryInput.value.trim(),
    responsible: resp,
    importance: importanceInput.value,
    priority: pri,
    dueDate: due,
    completed: false,
    createdAt: Date.now(),
    closedAt: null
  };
  await createTask(task);
  tasks.push(task);

  renderTasks();
  taskInput.value = '';
  categoryInput.value = '';
  responsibleInput.value = '';
  importanceInput.value = 'Alta';
  priorityInput.value = 'Alta';
  dueDateInput.value = '';
}

/** Cambia el estado de completada de una tarea */
async function toggleTask(id) {

  const task = tasks.find(t => t.id === id);
  if (!task) return;
  undoStack.push({ action: 'toggle', id, prevCompleted: task.completed, prevClosedAt: task.closedAt });
  task.completed = !task.completed;
  task.closedAt = task.completed ? Date.now() : null;
  await updateTask(task);

  renderTasks();
}

/** Elimina una tarea */
async function removeTask(id) {

  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return;
  const removed = tasks.splice(index, 1)[0];
  undoStack.push({ action: 'delete', task: removed, index });
  await deleteTask(id);

  renderTasks();
}

/** Edita el texto de una tarea */
async function editTask(id) {

  const li = Array.from(taskList.children).find(el => +el.dataset.id === id);
  const task = tasks.find(t => t.id === id);
  if (!li || !task) return;

  const input = document.createElement('input');
  input.value = task.text;
  li.querySelector('.info').replaceWith(input);
  input.focus();

  const saveEdit = async () => {

    const oldTask = { ...task };
    task.text = input.value.trim();
    const resp = prompt('Responsable', task.responsible || '');
    if (resp !== null) task.responsible = resp.trim();
    const imp = prompt('Importancia (Alta/Media/Baja)', task.importance || 'Alta');
    if (imp !== null) task.importance = imp;
    const pri = prompt('Prioridad (Alta/Media/Baja)', task.priority || 'Alta');
    if (pri !== null) task.priority = pri;
    const due = prompt('Fecha promesa (YYYY-MM-DD)', task.dueDate || '');
    if (due !== null) task.dueDate = due;
    undoStack.push({ action: 'edit', id, oldTask });
    await updateTask(task);

    renderTasks();
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit();
  });
}

/** Elimina todas las tareas */
async function clearAll() {
  if (tasks.length === 0) return;
  undoStack.push({ action: 'clear', tasks: [...tasks] });
  tasks = [];
  await fetch('backend/tasks.php', { method: 'DELETE' });

  renderTasks();
}

/** Deshace la ultima accion */
async function undo() {

  const last = undoStack.pop();
  if (!last) return;

  if (last.action === 'delete') {
    tasks.splice(last.index, 0, last.task);
  } else if (last.action === 'toggle') {
    const t = tasks.find(t => t.id === last.id);
    if (t) {
      t.completed = last.prevCompleted;
      t.closedAt = last.prevClosedAt;
    }
  } else if (last.action === 'edit') {
    const index = tasks.findIndex(t => t.id === last.id);
    if (index !== -1) tasks[index] = last.oldTask;

  } else if (last.action === 'clear') {
    tasks = last.tasks;
  }

  await loadTasks();

}

/** Inicializa el tema oscuro/claro */
function initTheme() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    saveTheme();
  });
}

// Eventos
addButton.addEventListener('click', addTask);
[taskInput, categoryInput, responsibleInput, dueDateInput].forEach(input =>
  input.addEventListener('keydown', e => e.key === 'Enter' && addTask())
);
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderTasks();
}));
searchInput.addEventListener('input', e => {
  searchText = e.target.value.toLowerCase();
  renderTasks();
});
sortSelect.addEventListener('change', e => {
  sortBy = e.target.value;
  renderTasks();
});
undoButton.addEventListener('click', undo);
clearButton.addEventListener('click', clearAll);
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') undo();
});

initTheme();
loadTasks();
