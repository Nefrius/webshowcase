// Todo App - Frontend JavaScript
class TodoApp {
    constructor() {
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }
    
    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.totalTasks = document.getElementById('totalTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        this.completedTasks = document.getElementById('completedTasks');
    }
    
    bindEvents() {
        // Add todo events
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });
        
        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // Global keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editingId) {
                this.cancelEdit();
            }
        });
    }
    
    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (!text) {
            this.todoInput.focus();
            return;
        }
        
        const todo = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.todos.unshift(todo);
        this.saveTodos();
        this.todoInput.value = '';
        this.render();
        this.todoInput.focus();
    }
    
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }
    
    deleteTodo(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.todos = this.todos.filter(t => t.id !== id);
            this.saveTodos();
            this.render();
        }
    }
    
    startEdit(id) {
        this.editingId = id;
        this.render();
        
        const editInput = document.querySelector(`[data-id="${id}"] .todo-edit-input`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
    
    saveEdit(id) {
        const editInput = document.querySelector(`[data-id="${id}"] .todo-edit-input`);
        const newText = editInput.value.trim();
        
        if (!newText) {
            alert('Task cannot be empty!');
            return;
        }
        
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
        }
        
        this.editingId = null;
        this.render();
    }
    
    cancelEdit() {
        this.editingId = null;
        this.render();
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        this.filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        this.render();
    }
    
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            case 'pending':
                return this.todos.filter(todo => !todo.completed);
            default:
                return this.todos;
        }
    }
    
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // Clear todo list
        this.todoList.innerHTML = '';
        
        // Show/hide empty state
        if (filteredTodos.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
        }
        
        // Render todos
        filteredTodos.forEach(todo => {
            const todoItem = this.createTodoElement(todo);
            this.todoList.appendChild(todoItem);
        });
        
        // Update stats
        this.updateStats();
    }
    
    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.setAttribute('data-id', todo.id);
        
        if (this.editingId === todo.id) {
            li.classList.add('editing');
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="app.toggleTodo('${todo.id}')">
                    <i class="fas fa-check"></i>
                </div>
                <input type="text" class="todo-edit-input" value="${this.escapeHtml(todo.text)}" onkeypress="if(event.key==='Enter') app.saveEdit('${todo.id}')">
                <div class="todo-edit-actions">
                    <button class="action-btn save-btn" onclick="app.saveEdit('${todo.id}')">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="action-btn cancel-btn" onclick="app.cancelEdit()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="app.toggleTodo('${todo.id}')">
                    <i class="fas fa-check"></i>
                </div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" onclick="app.startEdit('${todo.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="app.deleteTodo('${todo.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }
        
        return li;
    }
    
    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;
        
        this.totalTasks.textContent = total;
        this.pendingTasks.textContent = pending;
        this.completedTasks.textContent = completed;
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
    
    loadTodos() {
        const stored = localStorage.getItem('todos');
        return stored ? JSON.parse(stored) : [];
    }
    
    // Methods for backend integration (to be implemented later)
    async syncWithBackend() {
        // TODO: Implement API calls to sync with backend
        console.log('Backend sync not implemented yet');
    }
    
    async createTodoOnBackend(todo) {
        // TODO: POST /api/todos
        console.log('Creating todo on backend:', todo);
    }
    
    async updateTodoOnBackend(id, updates) {
        // TODO: PUT /api/todos/:id
        console.log('Updating todo on backend:', id, updates);
    }
    
    async deleteTodoOnBackend(id) {
        // TODO: DELETE /api/todos/:id
        console.log('Deleting todo on backend:', id);
    }
    
    async loadTodosFromBackend() {
        // TODO: GET /api/todos
        console.log('Loading todos from backend');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});

// Add some sample todos for demonstration (remove this in production)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.app.todos.length === 0) {
            const sampleTodos = [
                { id: 'sample1', text: 'Welcome to your Todo App! 🎉', completed: false, createdAt: new Date().toISOString() },
                { id: 'sample2', text: 'Click the checkbox to mark as complete', completed: false, createdAt: new Date().toISOString() },
                { id: 'sample3', text: 'Use the edit button to modify tasks', completed: false, createdAt: new Date().toISOString() },
                { id: 'sample4', text: 'This is a completed task', completed: true, createdAt: new Date().toISOString() }
            ];
            
            window.app.todos = sampleTodos;
            window.app.saveTodos();
            window.app.render();
        }
    }, 100);
});