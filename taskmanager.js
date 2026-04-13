let tasks = [];
let currentId = 0;
let editingId = null;

const taskCount = document.getElementById('task-count');

function createTaskCard(task) {
  const li = document.createElement('li');
  li.classList.add('task-card');
  li.setAttribute('data-id', task.id);
  li.setAttribute('data-priority', task.priority);

  // TITLE
  const title = document.createElement('span');
  title.textContent = task.title;
  title.classList.add('task-title');

  // DOUBLE CLICK EDIT
  title.addEventListener('dblclick', function () {
    const input = document.createElement('input');
    input.value = title.textContent;

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') saveEdit();
    });

    function saveEdit() {
      title.textContent = input.value;
      li.replaceChild(title, input);
    }

    li.replaceChild(input, title);
  });

  // DESCRIPTION
  const desc = document.createElement('p');
  desc.textContent = task.description;

  // PRIORITY
  const priority = document.createElement('span');
  priority.textContent = task.priority;

  // DATE
  const date = document.createElement('small');
  date.textContent = task.dueDate;

  // EDIT BUTTON
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.setAttribute('data-action', 'edit');
  editBtn.setAttribute('data-id', task.id);

  // DELETE BUTTON
  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.setAttribute('data-action', 'delete');
  delBtn.setAttribute('data-id', task.id);

  li.appendChild(title);
  li.appendChild(desc);
  li.appendChild(priority);
  li.appendChild(date);
  li.appendChild(editBtn);
  li.appendChild(delBtn);

  return li;
}

//addTask
function addTask(columnId, task) {
  const column = document.querySelector(`#${columnId} .task-list`);
  const card = createTaskCard(task);

  column.appendChild(card);
  tasks.push(task);

  updateCounter();
}

//delTask
function deleteTask(taskId) {

  const card = document.querySelector(`[data-id="${taskId}"]`);

  card.classList.add('fade-out');

  card.addEventListener('transitionend', () => {
    card.remove();
    tasks = tasks.filter(t => t.id !== taskId);
    updateCounter();
  });
}

//edit Task
function editTask(taskId) {

  const task = tasks.find(t => t.id === taskId);

  document.getElementById('titleInput').value = task.title;
  document.getElementById('descInput').value = task.description;
  document.getElementById('priorityInput').value = task.priority;
  document.getElementById('dateInput').value = task.dueDate;

  editingId = taskId;

  document.getElementById('modal').classList.remove('hidden');
}

//update Task
function updateTask(taskId, data) {

  const task = tasks.find(t => t.id === taskId);

  Object.assign(task, data);

  const card = document.querySelector(`[data-id="${taskId}"]`);
  card.querySelector('span').textContent = data.title;
}

function updateCounter() {
  taskCount.textContent = tasks.length;
}

function openModal(columnId) {
  document.getElementById('modal').classList.remove('hidden');

  document.getElementById('modal').setAttribute('data-column', columnId);

  editingId = null;
}

document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    openModal(this.parentElement.id);
  });
});

document.getElementById('saveBtn').addEventListener('click', function () {

  const data = {
    title: titleInput.value,
    description: descInput.value,
    priority: priorityInput.value,
    dueDate: dateInput.value
  };

  if (editingId !== null) {
    updateTask(editingId, data);
  } else {
    const column = document.getElementById('modal').getAttribute('data-column');

    addTask(column, {
      id: currentId++,
      ...data
    });
  }

  closeModal();
});