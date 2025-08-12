/**
 * StatsUIManager.js
 * Responsabilidad: Renderizar la sección de estadísticas.
 */
class StatsUIManager {
    constructor(taskManager, calendarManager) {
        this.taskManager = taskManager;
        this.calendarManager = calendarManager;
    }

    init() {
        this.cacheDOM();
        this.render();
    }

    cacheDOM() {
        this.dom = {
            statsTaskCount: document.getElementById('stats-task-count'),
            statsCompletedTasks: document.getElementById('stats-completed-tasks'),
            statsTotalEvents: document.getElementById('stats-total-events'),
            statsWeekEvents: document.getElementById('stats-week-events'),
        };
    }

    render() {
        const allItems = this.taskManager.getItems();
        const tasks = allItems.filter(item => item.itemType === 'task');
        const events = allItems.filter(item => item.itemType === 'event');
        const scheduledEvents = this.taskManager.getScheduledEvents();

        const completedTasks = tasks.filter(t => t.completed).length;
        this.dom.statsTaskCount.textContent = tasks.length - completedTasks;
        this.dom.statsCompletedTasks.textContent = completedTasks;

        const { dates } = this.calendarManager.getViewData();
        const weekStart = dates[0];
        const weekEnd = dates[dates.length - 1];

        const weekEventsCount = Object.values(scheduledEvents).filter(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            return eventDate >= weekStart && eventDate <= weekEnd;
        }).length;

        this.dom.statsTotalEvents.textContent = events.length;
        this.dom.statsWeekEvents.textContent = weekEventsCount;
    }
}
