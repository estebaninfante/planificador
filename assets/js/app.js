/**
 * app.js
 * * Punto de entrada principal de la aplicación.
 * Se encarga de inicializar todos los módulos en el orden correcto.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Managers de Lógica y Datos (no conocen el DOM)
    const storageManager = new StorageManager();
    const taskManager = new TaskManager(storageManager);
    const calendarManager = new CalendarManager();

    // 2. Managers de UI (conocen y manipulan el DOM)
    const sidebarUI = new SidebarUIManager(taskManager);
    const calendarUI = new CalendarUIManager(taskManager, calendarManager);
    const statsUI = new StatsUIManager(taskManager, calendarManager);

    // 3. Conectar todo
    // Cuando los datos cambien, todos los componentes de UI se re-renderizan.
    document.addEventListener('dataChanged', () => {
        sidebarUI.render();
        calendarUI.render();
        statsUI.render();
    });

    // Cuando la fecha o vista del calendario cambie, solo el calendario necesita re-renderizarse.
    document.addEventListener('viewChanged', () => calendarUI.render());
    document.addEventListener('dateChanged', () => calendarUI.render());

    // 4. Iniciar la aplicación
    sidebarUI.init();
    calendarUI.init();
    statsUI.init();
});
