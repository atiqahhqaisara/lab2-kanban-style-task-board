let tasks = [];
let currentId = 1;
let editingId = null;

const taskCount = document.getElementById('task-count');

/* CREATE TASK CARD */
function createTaskCard(task) {
  const li = document.createElement('li');
  li.classList.add('task-card');
  li.setAttribute('data-id', task.id);
  li.setAttribute('data-priority', task.priority);
  li.setAttribute('draggable', 'true');

  // drag start
  li.addEventListener('dragstart', function (e) {
    e.dataTransfer.setData('text/plain', task.id);
  });

  const title = document.createElement('span');
  title.textContent = task.title;
  title.classList.add('task-title');

  /* INLINE EDIT */
  title.addEventListener('dblclick', function () {
    const input = document.createElement('input');
    input.value = title.textContent;

    function save() {
      title.textContent = input.value;
      li.replaceChild(title, input);

      const t = tasks.find(t => t.id === task.id);
      if (t) t.title = input.value;
    }

    input.addEventListener('blur', save);
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') save();
    });

    li.replaceChild(input, title);
  });

  const desc = document.createElement('p');
  desc.textContent = task.description;

  const meta = document.createElement('div');
  meta.classList.add('task-meta');

  const priority = document.createElement('div');
  priority.textContent = "📌 Priority: " + task.priority;

  const date = document.createElement('div');
  date.textContent = "📅 Due: " + task.dueDate;

  meta.append(priority, date);

  const editBtn = document.createElement('button');
  editBtn.textContent = "Edit";
  editBtn.setAttribute('data-action', 'edit');
  editBtn.setAttribute('data-id', task.id);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = "Delete";
  deleteBtn.setAttribute('data-action', 'delete');
  deleteBtn.setAttribute('data-id', task.id);

  const actions = document.createElement('div');
  actions.classList.add('task-actions');
  actions.append(editBtn, deleteBtn);

  li.append(title, desc, meta, actions);

  return li;
}

/* ADD TASK */
function addTask(columnId, task) {
  task.column = columnId; // ✅ IMPORTANT FIX

  const list = document.querySelector(`#${columnId} .task-list`);
  const card = createTaskCard(task);

  list.appendChild(card);
  tasks.push(task);

  updateCounter();
}

/* DELETE TASK */
function deleteTask(id) {
  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;

  card.classList.add('fade-out');

  card.addEventListener('transitionend', () => {
    card.remove();
    tasks = tasks.filter(t => t.id !== id);
    updateCounter();
  });
}

/* EDIT TASK */
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  titleInput.value = task.title;
  descInput.value = task.description;
  priorityInput.value = task.priority;
  dateInput.value = task.dueDate;

  editingId = id;
  modal.classList.remove('hidden');
}

/* UPDATE TASK */
function updateTask(id, data) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  Object.assign(task, data);

  const card = document.querySelector(`[data-id="${id}"]`);
  if (!card) return;

  card.querySelector('.task-title').textContent = data.title;
  card.querySelector('p').textContent = data.description;

  card.querySelector('.task-meta').children[0].textContent =
    "📌 Priority: " + data.priority;

  card.querySelector('.task-meta').children[1].textContent =
    "📅 Due: " + data.dueDate;

  card.setAttribute('data-priority', data.priority);
}

/* COUNTER */
function updateCounter() {
  taskCount.textContent = tasks.length;
}

/* MODAL */
const modal = document.getElementById('modal');
const titleInput = document.getElementById('titleInput');
const descInput = document.getElementById('descInput');
const priorityInput = document.getElementById('priorityInput');
const dateInput = document.getElementById('dateInput');

function openModal(columnId) {
  modal.classList.remove('hidden');
  modal.setAttribute('data-column', columnId);

  titleInput.value = "";
  descInput.value = "";
  priorityInput.value = "medium";
  dateInput.value = "";

  editingId = null;
}

function closeModal() {
  modal.classList.add('hidden');
}

/* ADD BUTTONS */
document.querySelectorAll('.add-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    openModal(this.parentElement.id);
  });
});

/* SAVE */
document.getElementById('saveBtn').addEventListener('click', () => {
  const data = {
    title: titleInput.value,
    description: descInput.value,
    priority: priorityInput.value,
    dueDate: dateInput.value
  };

  if (editingId !== null) {
    updateTask(editingId, data);
  } else {
    const column = modal.getAttribute('data-column');

    addTask(column, {
      id: currentId++,
      ...data
    });
  }

  closeModal();
});

/* CANCEL */
document.getElementById('cancelBtn').addEventListener('click', closeModal);

/* EVENT DELEGATION */
document.querySelectorAll('.task-list').forEach(list => {
  list.addEventListener('click', e => {
    const action = e.target.getAttribute('data-action');
    const idAttr = e.target.getAttribute('data-id');

    if (!idAttr) return;

    const id = parseInt(idAttr);

    if (action === 'delete') deleteTask(id);
    if (action === 'edit') editTask(id);
  });
});

/* FILTER */
document.getElementById('priorityFilter').addEventListener('change', function () {
  document.querySelectorAll('.task-card').forEach(card => {
    const match =
      this.value === 'all' ||
      card.getAttribute('data-priority') === this.value;

    card.classList.toggle('is-hidden', !match);
  });
});

/* CLEAR DONE */
document.getElementById('clearDone').addEventListener('click', () => {
  const cards = document.querySelectorAll('#done .task-card');

  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add('fade-out');
      card.addEventListener('transitionend', () => {
        const id = parseInt(card.getAttribute('data-id'));
        tasks = tasks.filter(t => t.id !== id);
        card.remove();
        updateCounter();
      });
    }, i * 100);
  });
});

/* DRAG & DROP */
document.querySelectorAll('.task-list').forEach(list => {

  list.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.classList.add('drag-over'); // visual feedback
  });

  list.addEventListener('dragleave', function () {
    this.classList.remove('drag-over'); // remove highlight when leaving
  });

  list.addEventListener('drop', function (e) {
    e.preventDefault();
    this.classList.remove('drag-over'); // clean up highlight

    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const card = document.querySelector(`[data-id="${taskId}"]`);

    if (card) { // guard in case card isn't found
      this.appendChild(card);

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const newColumn = this.closest('.column').id;
        task.column = newColumn;
      }
    }
  });

});

