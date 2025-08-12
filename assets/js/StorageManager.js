/**
 * StorageManager.js
 * * Responsabilidad Única: Gestionar la persistencia de datos en el localStorage.
 */
class StorageManager {
    constructor() {
        // Se actualizan las claves de localStorage para reflejar la nueva versión
        this.KEYS = {
            tasks: 'timeManager_tasks_v5',
            schedule: 'timeManager_schedule_v5'
        };
    }

    getFromStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            const data = item ? JSON.parse(item) : defaultValue;
            
            if (key === this.KEYS.tasks && Array.isArray(data)) {
                data.forEach(task => {
                    // Asegurar que itemType y subtasks existan para versiones antiguas
                    if (!task.itemType) {
                        task.itemType = (task.type === 'Clase') ? 'event' : 'task';
                    }
                    if (task.itemType === 'task' && !Array.isArray(task.subtasks)) {
                        task.subtasks = [];
                    }
                });
            } else if (key === this.KEYS.schedule && typeof data === 'object' && data !== null) {
                // MODIFICACIÓN AÑADIDA: Convertir el formato antiguo al nuevo
                // El formato antiguo usaba 'taskId', 'startHour', 'endHour'
                // El nuevo usa 'itemId', 'startTime', 'endTime'
                const newData = {};
                for (const instanceId in data) {
                    const event = data[instanceId];
                    newData[instanceId] = {
                        itemId: event.itemId || event.taskId, // Usa taskId si itemId no existe
                        date: event.date,
                        startTime: event.startTime || event.startHour, // Usa startHour si startTime no existe
                        endTime: event.endTime || event.endHour, // Usa endHour si endTime no existe
                    };
                }
                return newData;
            }

            return data;
        } catch (error) {
            console.error(`Error al leer desde localStorage con la clave "${key}":`, error);
            return defaultValue;
        }
    }

    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error al guardar en localStorage con la clave "${key}":`, error);
        }
    }

    getTasks() {
        return this.getFromStorage(this.KEYS.tasks, []);
    }

    saveTasks(tasks) {
        this.saveToStorage(this.KEYS.tasks, tasks);
    }

    getSchedule() {
        return this.getFromStorage(this.KEYS.schedule, {});
    }

    saveSchedule(schedule) {
        this.saveToStorage(this.KEYS.schedule, schedule);
    }
}