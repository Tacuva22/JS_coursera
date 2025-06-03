/**
 * script.js - Logica de la lista de tareas (Todo List)
 * Permite agregar, completar y eliminar tareas.
 * Las tareas se guardan en localStorage para mantenerlas entre recargas.
 */

// Cargar tareas almacenadas o iniciar con una lista vacia
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Referencias a elementos del DOM
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const addButton = document.getElementById('addButton');

/**
 * Muestra las tareas en la pagina.
 */
function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.text;

    // Marcar visualmente la tarea completada
    if (task.completed) {
      li.classList.add('completed');
    }

    // Boton para completar o deshacer la tarea
    const completeBtn = document.createElement('button');
    completeBtn.textContent = task.completed ? 'Deshacer' : 'Completar';
    completeBtn.addEventListener('click', () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    // Boton para eliminar la tarea de la lista
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.append(' ', completeBtn, ' ', deleteBtn);
    taskList.appendChild(li);
  });
}

/**
 * Guarda las tareas actuales en localStorage.
 */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Registrar el evento para agregar nuevas tareas
addButton.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (text) {
    tasks.push({ text, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
  }
});

// Mostrar tareas existentes al cargar la pagina
renderTasks();
