// Variables globales
let projects = [];
let newTasks = [];

// Elementos del DOM
const projectBody = document.getElementById('project-body');
const addProjectBtn = document.getElementById('add-project-btn');
const addNewTaskBtn = document.getElementById('add-new-task-btn');
const newTaskList = document.getElementById('new-task-list');

// Elementos del DOM para el inicio de sesión
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const loginError = document.getElementById('login-error');

// Función de inicio de sesión
loginButton.addEventListener('click', () => {
    const password = passwordInput.value;
    if (password === 'jersoning') {
        // Ocultar el contenedor de inicio de sesión y mostrar la aplicación
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
        // Cargar proyectos desde localStorage
        loadProjectsFromStorage();
        // Renderizar proyectos
        renderProjects();
        renderNewTasks();
    } else {
        loginError.style.display = 'block';
    }
});

// Guardar proyectos en localStorage
function saveProjectsToStorage() {
    localStorage.setItem('projects', JSON.stringify(projects));
}

// Cargar proyectos desde localStorage
function loadProjectsFromStorage() {
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
        projects = JSON.parse(storedProjects);
    }
}

// Función para agregar una nueva tarea antes de crear el proyecto
addNewTaskBtn.addEventListener('click', () => {
    const task = {
        name: '',
        description: '',
        completed: false
    };
    newTasks.push(task);
    renderNewTasks();
});

function renderNewTasks() {
    newTaskList.innerHTML = '';
    newTasks.forEach((task, index) => {
        const taskDiv = document.createElement('div');
        taskDiv.classList.add('task-item');
        taskDiv.innerHTML = `
            <input type="checkbox" disabled>
            <input type="text" placeholder="Nombre de la tarea" value="${task.name}">
            <input type="text" placeholder="Descripción" value="${task.description}">
            <button class="delete-task-btn" data-index="${index}">🗑️</button>
        `;
        newTaskList.appendChild(taskDiv);
    });
    // Añadir eventos a los botones de eliminar
    document.querySelectorAll('#new-task-list .delete-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            newTasks.splice(index, 1);
            renderNewTasks();
        });
    });
    // Añadir eventos para actualizar los valores de las tareas
    document.querySelectorAll('#new-task-list .task-item input[type="text"]').forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            const taskIndex = Math.floor(idx / 2);
            const inputType = idx % 2 === 0 ? 'name' : 'description';
            newTasks[taskIndex][inputType] = e.target.value;
        });
    });
}

// Función para agregar un nuevo proyecto
addProjectBtn.addEventListener('click', () => {
    const name = document.getElementById('new-project-name').value;
    const description = document.getElementById('new-project-description').value;
    const priority = document.getElementById('new-project-priority').value;

    if (name.trim() === '') {
        alert('El nombre del proyecto es obligatorio.');
        return;
    }

    const project = {
        name,
        description,
        priority,
        tasks: JSON.parse(JSON.stringify(newTasks)) // Clonar las tareas
    };

    projects.push(project);
    projects = sortProjects(projects);
    saveProjectsToStorage(); // Guardar en localStorage
    renderProjects();

    // Limpiar los campos para que queden en blanco después de crear el proyecto
    document.getElementById('new-project-name').value = '';
    document.getElementById('new-project-description').value = '';
    document.getElementById('new-project-priority').value = 'Normal';
    newTasks = [];
    renderNewTasks();
});

// Función para renderizar los proyectos en la tabla
function renderProjects() {
    projectBody.innerHTML = '';
    projects.forEach((project, projIndex) => {
        const row = document.createElement('tr');
        row.classList.add(`priority-${project.priority}`);

        // Celda del nombre del proyecto
        const nameCell = document.createElement('td');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = project.name;
        nameInput.addEventListener('input', (e) => {
            project.name = e.target.value;
            saveProjectsToStorage();
        });
        nameCell.appendChild(nameInput);
        row.appendChild(nameCell);

        // Celda de la descripción del proyecto
        const descCell = document.createElement('td');
        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.value = project.description;
        descInput.addEventListener('input', (e) => {
            project.description = e.target.value;
            saveProjectsToStorage();
        });
        descCell.appendChild(descInput);
        row.appendChild(descCell);

        // Celda de las tareas
        const tasksCell = document.createElement('td');
        const tasksList = document.createElement('div');
        project.tasks.forEach((task, taskIndex) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task-item');
            taskDiv.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <input type="text" value="${task.name}">
                <input type="text" value="${task.description}">
                <button class="delete-task-btn" data-proj-index="${projIndex}" data-task-index="${taskIndex}">🗑️</button>
            `;
            if (task.completed) {
                taskDiv.querySelectorAll('input[type="text"]').forEach(input => {
                    input.classList.add('completed');
                });
            }
            tasksList.appendChild(taskDiv);
        });

        // Contenedor para los íconos de agregar tarea y eliminar proyecto
        const iconsContainer = document.createElement('div');
        iconsContainer.classList.add('icons-container');

        const addTaskBtn = document.createElement('button');
        addTaskBtn.classList.add('add-task-btn');
        addTaskBtn.innerHTML = '➕'; // Ícono de agregar
        addTaskBtn.title = 'Agregar Tarea';
        addTaskBtn.addEventListener('click', () => {
            const newTask = {
                name: '',
                description: '',
                completed: false
            };
            project.tasks.push(newTask);
            saveProjectsToStorage();
            renderProjects();
        });

        const deleteProjectBtn = document.createElement('button');
        deleteProjectBtn.classList.add('delete-project-btn');
        deleteProjectBtn.innerHTML = '🗑️ ELIMINAR PROYECTO'; // Ícono y texto
        deleteProjectBtn.title = 'Eliminar Proyecto';
        deleteProjectBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
                projects.splice(projIndex, 1);
                saveProjectsToStorage();
                renderProjects();
            }
        });

        iconsContainer.appendChild(addTaskBtn);
        iconsContainer.appendChild(deleteProjectBtn);

        tasksCell.appendChild(tasksList);
        tasksCell.appendChild(iconsContainer);
        row.appendChild(tasksCell);

        // Celda de la prioridad
        const priorityCell = document.createElement('td');
        const prioritySelect = document.createElement('select');
        ['Normal', 'Importante', 'Urgente'].forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            if (project.priority === level) {
                option.selected = true;
            }
            prioritySelect.appendChild(option);
        });
        prioritySelect.addEventListener('change', (e) => {
            project.priority = e.target.value;
            projects = sortProjects(projects);
            saveProjectsToStorage();
            renderProjects();
        });
        priorityCell.appendChild(prioritySelect);
        row.appendChild(priorityCell);

        projectBody.appendChild(row);
    });

    // Añadir eventos dinámicos
    addDynamicEventListeners();
}

// Función para ordenar los proyectos por prioridad
function sortProjects(projects) {
    const priorityOrder = {
        'Urgente': 1,
        'Importante': 2,
        'Normal': 3
    };
    return projects.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

// Añadir eventos dinámicos a los elementos de tareas
function addDynamicEventListeners() {
    // Eventos para checkboxes de tareas
    document.querySelectorAll('.task-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const projIndex = Array.from(projectBody.children).indexOf(e.target.closest('tr'));
            const taskIndex = Array.from(e.target.closest('.task-item').parentNode.children).indexOf(e.target.closest('.task-item'));
            projects[projIndex].tasks[taskIndex].completed = e.target.checked;
            saveProjectsToStorage();
            renderProjects();
        });
    });
    // Eventos para eliminar tareas
    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projIndex = btn.getAttribute('data-proj-index');
            const taskIndex = btn.getAttribute('data-task-index');
            projects[projIndex].tasks.splice(taskIndex, 1);
            saveProjectsToStorage();
            renderProjects();
        });
    });
    // Eventos para inputs de tareas
    document.querySelectorAll('.task-item input[type="text"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const projIndex = Array.from(projectBody.children).indexOf(e.target.closest('tr'));
            const taskIndex = Array.from(e.target.closest('.task-item').parentNode.children).indexOf(e.target.closest('.task-item'));
            const inputIndex = Array.from(e.target.parentNode.children).indexOf(e.target);
            if (inputIndex === 1) {
                projects[projIndex].tasks[taskIndex].name = e.target.value;
            } else if (inputIndex === 2) {
                projects[projIndex].tasks[taskIndex].description = e.target.value;
            }
            saveProjectsToStorage();
        });
    });
}

// No inicializamos la aplicación aquí, se hará después del login exitoso
