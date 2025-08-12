/**
 * SidebarUIManager.js
 * Responsabilidad: Gestionar la barra lateral, incluyendo listas, pestañas y modales.
 */
class SidebarUIManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.taskSortOrder = 'default';
        this.eventSortOrder = 'default';
        this.currentTab = 'tasks';
    }

    init() {
        this.cacheDOM();
        this.bindEventListeners();
        this.render();
    }

    cacheDOM() {
        this.dom = {
            taskList: document.getElementById('task-list'),
            eventList: document.getElementById('event-list'),
            tasksTabBtn: document.getElementById('tasks-tab-btn'),
            eventsTabBtn: document.getElementById('events-tab-btn'),
            bulkAddTabBtn: document.getElementById('bulk-add-tab-btn'),
            tasksTabContent: document.getElementById('tasks-tab-content'),
            eventsTabContent: document.getElementById('events-tab-content'),
            bulkAddTabContent: document.getElementById('bulk-add-tab-content'),
            openModalBtn: document.getElementById('open-modal-btn'),
            sortTasksBtn: document.getElementById('sort-tasks-btn'),
            sortEventsBtn: document.getElementById('sort-events-btn'),
            addBulkBtn: document.getElementById('add-bulk-btn'),
            quickAddInput: document.getElementById('quick-add-input'),
            bulkJsonInput: document.getElementById('bulk-json-input'),
            choiceModal: document.getElementById('choice-modal'),
            createTaskChoiceBtn: document.getElementById('create-task-choice-btn'),
            createEventChoiceBtn: document.getElementById('create-event-choice-btn'),
            unifiedModal: document.getElementById('unified-modal'),
            modalTitle: document.getElementById('modal-title'),
            taskForm: document.getElementById('task-form'),
            deleteItemBtn: document.getElementById('delete-item-btn'),
            itemId: document.getElementById('item-id'),
            itemType: document.getElementById('item-type'),
            itemName: document.getElementById('item-name'),
            itemPriority: document.getElementById('item-priority'),
            itemCategory: document.getElementById('item-category'),
            itemColor: document.getElementById('item-color'),
            itemNotes: document.getElementById('item-notes'),
            subtaskSection: document.getElementById('subtask-section'),
            scheduleSection: document.getElementById('schedule-section'),
            eventDate: document.getElementById('event-date'),
            eventStartTime: document.getElementById('event-start-time'),
            eventEndTime: document.getElementById('event-end-time'),
        };
    }

    bindEventListeners() {
        this.dom.tasksTabBtn.addEventListener('click', () => this.switchTab('tasks'));
        this.dom.eventsTabBtn.addEventListener('click', () => this.switchTab('events'));
        this.dom.bulkAddTabBtn.addEventListener('click', () => this.switchTab('bulk'));

        this.dom.openModalBtn.addEventListener('click', () => this.dom.choiceModal.classList.add('visible'));
        this.dom.quickAddInput.addEventListener('keyup', e => {
            if (e.key === 'Enter' && e.target.value.trim()) this.handleQuickAdd(e.target.value.trim());
        });
        this.dom.addBulkBtn.addEventListener('click', () => this.handleAddBulk());

        this.dom.sortTasksBtn.addEventListener('click', () => this.toggleSort('task'));
        this.dom.sortEventsBtn.addEventListener('click', () => this.toggleSort('event'));

        this.dom.choiceModal.addEventListener('click', e => this.handleCloseModal(e));
        this.dom.unifiedModal.addEventListener('click', e => this.handleCloseModal(e));
        this.dom.createTaskChoiceBtn.addEventListener('click', () => this.openModal({ itemType: 'task' }));
        this.dom.createEventChoiceBtn.addEventListener('click', () => this.openModal({ itemType: 'event' }));
        
        this.dom.taskForm.addEventListener('submit', e => this.handleFormSubmit(e));
        this.dom.deleteItemBtn.addEventListener('click', () => this.handleDeleteItem());

        document.addEventListener('showToast', e => this.showToast(e.detail.message, e.detail.type));
    }

    render() {
        this.renderItemLists();
    }

    renderItemLists() {
        const allItems = this.taskManager.getItems();
        let tasks = allItems.filter(item => item.itemType === 'task');
        let events = allItems.filter(item => item.itemType === 'event');

        tasks.sort((a, b) => a.completed - b.completed);

        const priorityMap = { 'Alta': 0, 'Media': 1, 'Baja': 2 };
        if (this.taskSortOrder === 'priority') {
            tasks.sort((a, b) => (a.completed - b.completed) || (priorityMap[a.priority] - priorityMap[b.priority]));
        } else if (this.taskSortOrder === 'name') {
            tasks.sort((a, b) => (a.completed - b.completed) || a.name.localeCompare(b.name));
        }

        if (this.eventSortOrder === 'proximity') {
             const today = new Date().toISOString().slice(0, 10);
             const getNextDate = (itemId) => {
                 const futureEvents = Object.values(this.taskManager.getScheduledEvents())
                     .filter(e => e.itemId === itemId && e.date >= today)
                     .sort((a, b) => a.date.localeCompare(b.date));
                 return futureEvents.length > 0 ? futureEvents[0].date : '9999-12-31';
             };
             events.sort((a, b) => getNextDate(a.id).localeCompare(getNextDate(b.id)));
        } else if (this.eventSortOrder === 'name') {
            events.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.renderItems(this.dom.taskList, tasks, 'task');
        this.renderItems(this.dom.eventList, events, 'event');
    }

    renderItems(container, items, itemType) {
        container.innerHTML = '';
        if (items.length === 0) {
            container.innerHTML = `<p class="text-center text-gray-500 text-sm py-4">No hay ${itemType === 'task' ? 'tareas' : 'eventos'}.</p>`;
            return;
        }
        items.forEach(item => {
            const card = this.createItemCard(item);
            container.appendChild(card);
        });
    }

    createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.itemId = item.id;
        card.style.setProperty('--item-color', item.color);
        card.draggable = true;

        if (item.itemType === 'task') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'custom-checkbox';
            checkbox.checked = item.completed;
            checkbox.addEventListener('click', e => {
                e.stopPropagation();
                this.taskManager.toggleTaskCompletion(item.id);
            });
            card.appendChild(checkbox);
        }

        const content = document.createElement('div');
        content.className = 'flex-grow cursor-pointer';
        content.innerHTML = `
            <div class="font-semibold truncate item-name">${item.name}</div>
            <p class="text-sm text-gray-400 truncate">${item.category || 'General'}</p>
        `;
        card.appendChild(content);
        
        if(item.completed) card.classList.add('completed');

        content.addEventListener('click', () => this.openModal({ itemId: item.id }));
        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', item.id);
        });
        return card;
    }

    switchTab(tab) {
        this.currentTab = tab;
        this.dom.tasksTabContent.classList.toggle('hidden', tab !== 'tasks');
        this.dom.eventsTabContent.classList.toggle('hidden', tab !== 'events');
        this.dom.bulkAddTabContent.classList.toggle('hidden', tab !== 'bulk');
        
        this.dom.tasksTabBtn.classList.toggle('active', tab === 'tasks');
        this.dom.eventsTabBtn.classList.toggle('active', tab === 'events');
        this.dom.bulkAddTabBtn.classList.toggle('active', tab === 'bulk');
    }

    handleQuickAdd(name) {
        this.taskManager.addItem({ name, itemType: 'task' });
        this.dom.quickAddInput.value = '';
        this.showToast('Tarea rápida añadida');
    }

    handleAddBulk() {
        try {
            const items = JSON.parse(this.dom.bulkJsonInput.value);
            if (!Array.isArray(items)) throw new Error("El JSON debe ser un array.");
            this.taskManager.addBulkItems(items);
            this.showToast(`${items.length} items añadidos correctamente.`);
            this.dom.bulkJsonInput.value = '';
            this.switchTab('tasks');
        } catch (e) {
            this.showToast(`Error en el formato JSON: ${e.message}`, 'error');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const id = this.dom.itemId.value;
        const itemType = this.dom.itemType.value;
        const data = {
            name: this.dom.itemName.value,
            priority: this.dom.itemPriority.value,
            category: this.dom.itemCategory.value,
            color: this.dom.itemColor.value,
            notes: this.dom.itemNotes.value,
            itemType: itemType,
        };

        let newItemId = id;
        if (id) {
            this.taskManager.updateItem(id, data);
        } else {
            const newItem = this.taskManager.addItem(data);
            newItemId = newItem.id;
        }

        if (itemType === 'event') {
            this.taskManager.scheduleEvent({
                itemId: newItemId,
                date: this.dom.eventDate.value,
                startTime: this.dom.eventStartTime.value,
                endTime: this.dom.eventEndTime.value,
            });
        }

        this.closeAllModals();
        this.showToast(`Elemento ${id ? 'actualizado' : 'creado'}`);
    }

    handleDeleteItem() {
        const id = this.dom.itemId.value;
        if (confirm('¿Estás seguro?')) {
            this.taskManager.deleteItems([id]);
            this.closeAllModals();
            this.showToast('Elemento eliminado', 'error');
        }
    }

    toggleSort(type) {
        if (type === 'task') {
            const orders = ['default', 'priority', 'name'];
            const current = orders.indexOf(this.taskSortOrder);
            this.taskSortOrder = orders[(current + 1) % orders.length];
            this.showToast(`Tareas ordenadas por: ${this.taskSortOrder}`);
        } else {
            const orders = ['default', 'proximity', 'name'];
            const current = orders.indexOf(this.eventSortOrder);
            this.eventSortOrder = orders[(current + 1) % orders.length];
            this.showToast(`Eventos ordenados por: ${this.eventSortOrder}`);
        }
        this.renderItemLists();
    }

    openModal(options = {}) {
        const { itemId, itemType } = options;
        this.dom.taskForm.reset();
        this.dom.choiceModal.classList.remove('visible');
        
        const item = itemId ? this.taskManager.getItemById(itemId) : null;
        const finalItemType = item ? item.itemType : itemType;

        this.dom.itemId.value = itemId || '';
        this.dom.itemType.value = finalItemType;
        this.dom.modalTitle.textContent = item ? `Editar ${finalItemType === 'task' ? 'Tarea' : 'Evento'}` : `Nueva ${finalItemType === 'task' ? 'Tarea' : 'Evento'}`;
        this.dom.deleteItemBtn.classList.toggle('hidden', !item);

        if (item) {
            this.dom.itemName.value = item.name;
            this.dom.itemPriority.value = item.priority;
            this.dom.itemCategory.value = item.category;
            this.dom.itemColor.value = item.color;
            this.dom.itemNotes.value = item.notes;
        }

        this.dom.subtaskSection.classList.toggle('hidden', finalItemType !== 'task');
        this.dom.scheduleSection.classList.toggle('hidden', finalItemType !== 'event');
        
        if (finalItemType === 'event') {
            this.dom.eventDate.value = new Date().toISOString().slice(0,10);
        }

        this.dom.unifiedModal.classList.add('visible');
    }

    handleCloseModal(e) {
        if (e.target.classList.contains('modal') || e.target.closest('.close-modal-btn')) {
            this.closeAllModals();
        }
    }

    closeAllModals() {
        this.dom.choiceModal.classList.remove('visible');
        this.dom.unifiedModal.classList.remove('visible');
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
}
