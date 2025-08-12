/**
 * TaskManager.js
 * * Responsabilidad Única: Gestionar el estado y la lógica de los datos de tareas y eventos.
 */
class TaskManager {
    constructor(storageManager) {
        this.storageManager = storageManager;
        this.tasks = this.storageManager.getTasks();
        this.scheduledEvents = this.storageManager.getSchedule();
    }

    _generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    _commit() {
        this.storageManager.saveTasks(this.tasks);
        this.storageManager.saveSchedule(this.scheduledEvents);
        document.dispatchEvent(new CustomEvent('dataChanged'));
    }

    getItems() {
        return this.tasks;
    }

    getItemById(itemId) {
        return this.tasks.find(item => item.id === itemId);
    }

    addItem(itemData) {
        const newItem = {
            id: this._generateId(),
            completed: false, // Nueva propiedad para tareas
            ...itemData,
            subtasks: itemData.itemType === 'task' ? (itemData.subtasks || []) : undefined,
        };
        this.tasks.push(newItem);
        this._commit();
        return newItem;
    }

    addBulkItems(items) {
        items.forEach(itemData => {
            if (!itemData.name || !itemData.itemType) return;
            this.addItem(itemData);
        });
        this._commit();
    }

    updateItem(itemId, updatedData) {
        const item = this.getItemById(itemId);
        if (item) {
            Object.assign(item, updatedData);
            this._commit();
        }
    }
    
    toggleTaskCompletion(taskId) {
        const task = this.getItemById(taskId);
        if (task && task.itemType === 'task') {
            task.completed = !task.completed;
            this._commit();
        }
    }

    deleteItems(itemIds) {
        this.tasks = this.tasks.filter(item => !itemIds.includes(item.id));
        Object.keys(this.scheduledEvents).forEach(instanceId => {
            if (itemIds.includes(this.scheduledEvents[instanceId].itemId)) {
                delete this.scheduledEvents[instanceId];
            }
        });
        this._commit();
    }

    getScheduledEvents() {
        return this.scheduledEvents;
    }

    scheduleEvent(eventData) {
        const instanceId = this._generateId();
        this.scheduledEvents[instanceId] = {
            itemId: eventData.itemId,
            date: eventData.date,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
        };
        this._commit();
        return instanceId;
    }

    updateScheduledEvent(instanceId, updatedData) {
        if (this.scheduledEvents[instanceId]) {
            Object.assign(this.scheduledEvents[instanceId], updatedData);
            this._commit();
        }
    }
}
