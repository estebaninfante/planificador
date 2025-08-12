/**
 * CalendarUIManager.js
 * Responsabilidad: Renderizar y manejar interacciones del calendario.
 */
class CalendarUIManager {
    constructor(taskManager, calendarManager) {
        this.taskManager = taskManager;
        this.calendarManager = calendarManager;
        this.calendarInteraction = {}; // State for drag/resize
    }

    init() {
        this.cacheDOM();
        this.bindEventListeners();
        this.render();
        setInterval(() => this.renderCurrentTimeIndicator(), 60000);
    }

    cacheDOM() {
        this.dom = {
            calendarContainer: document.getElementById('calendar-container'),
            currentWeekRange: document.getElementById('current-week-range'),
            prevWeekBtn: document.getElementById('prev-week-btn'),
            nextWeekBtn: document.getElementById('next-week-btn'),
            dayViewBtn: document.getElementById('day-view-btn'),
            weekViewBtn: document.getElementById('week-view-btn'),
            downloadCalendarBtn: document.getElementById('download-calendar-btn'),
            goToTodayBtn: document.getElementById('go-to-today-btn'),
        };
    }

    bindEventListeners() {
    this.dom.prevWeekBtn.addEventListener('click', () => this.calendarManager.navigate('prev'));
    this.dom.nextWeekBtn.addEventListener('click', () => this.calendarManager.navigate('next'));
    this.dom.dayViewBtn.addEventListener('click', () => this.calendarManager.setView('day'));
    this.dom.weekViewBtn.addEventListener('click', () => this.calendarManager.setView('week'));
    this.dom.goToTodayBtn.addEventListener('click', () => this.calendarManager.goToToday());
    this.dom.downloadCalendarBtn.addEventListener('click', () => this.downloadCalendarAsPDF());

    // Global listeners for drag/resize
    document.addEventListener('mousemove', e => this.onCalendarMouseMove(e));
    // MODIFICADO: Pasamos el evento a onCalendarMouseUp
    document.addEventListener('mouseup', e => this.onCalendarMouseUp(e));
    }

    render() {
        const { dates, rangeText, today } = this.calendarManager.getViewData();
        this.dom.currentWeekRange.textContent = rangeText;
        this.dom.calendarContainer.innerHTML = '';

        const grid = document.createElement('div');
        grid.id = 'calendar-grid';
        this.dom.calendarContainer.appendChild(grid);
        
        this.dom.calendarContainer.classList.toggle('day-view', this.calendarManager.view === 'day');

        grid.innerHTML += '<div class="time-header"></div>';
        
        const weekdays = ["L", "M", "X", "J", "V", "S", "D"];
        dates.forEach(date => {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-header';
            dayEl.innerHTML = `${weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]} <span class="text-xs font-normal">${date.getDate()}</span>`;
            if (date.getTime() === today.getTime()) dayEl.classList.add('current-day');
            grid.appendChild(dayEl);
        });

        for (let i = 0; i < 36; i++) {
            const hour = 6 + Math.floor(i / 2);
            if (i % 2 === 0) grid.innerHTML += `<div class="time-slot" style="grid-row: ${i + 2}">${hour}:00</div>`;
            grid.innerHTML += `<div class="grid-line" style="grid-row: ${i + 2}; grid-column: 2 / span ${dates.length};"></div>`;
        }
        dates.forEach((date, index) => {
            const columnEl = document.createElement('div');
            columnEl.className = 'day-column';
            columnEl.dataset.date = date.toISOString().slice(0, 10);
            columnEl.style.gridColumn = `${index + 2}`;
            columnEl.style.gridRow = '2 / span 36';
            grid.appendChild(columnEl);
        });

        this.renderScheduledEvents();
        this.renderCurrentTimeIndicator();
        this.bindCalendarInteractions();
        this.updateViewControls();
    }
    
    renderScheduledEvents() {
        const scheduledEvents = this.taskManager.getScheduledEvents();
        const timeSlotHeight = 60;

        Object.entries(scheduledEvents).forEach(([instanceId, event]) => {
            const column = this.dom.calendarContainer.querySelector(`.day-column[data-date="${event.date}"]`);
            if (!column) return;

            const item = this.taskManager.getItemById(event.itemId);
            if (!item) return;

            const [startH, startM] = event.startTime.split(':').map(Number);
            const [endH, endM] = event.endTime.split(':').map(Number);

            const top = ((startH - 6) + startM / 60) * timeSlotHeight;
            const duration = ((endH * 60 + endM) - (startH * 60 + startM)) / 60;
            const height = Math.max(duration * timeSlotHeight, timeSlotHeight / 2);

            const eventEl = document.createElement('div');
            eventEl.className = 'calendar-event';
            eventEl.dataset.instanceId = instanceId;
            eventEl.style.setProperty('--item-color', item.color);
            eventEl.style.top = `${top}px`;
            eventEl.style.height = `${height}px`;

            eventEl.innerHTML = `
                <div class="font-semibold text-xs truncate">${item.name}</div>
                <div class="text-xs">${event.startTime} - ${event.endTime}</div>
                <div class="resize-handle top"></div>
                <div class="resize-handle bottom"></div>
            `;
            eventEl.addEventListener('mousedown', e => this.onCalendarMouseDown(e, instanceId));
            column.appendChild(eventEl);
        });
    }

    renderCurrentTimeIndicator() {
        const existing = this.dom.calendarContainer.querySelector('.current-time-indicator');
        if (existing) existing.remove();

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const column = this.dom.calendarContainer.querySelector(`.day-column[data-date="${todayStr}"]`);

        if (column) {
            const timeSlotHeight = 60;
            const minutesSince6AM = (now.getHours() * 60 + now.getMinutes()) - (6 * 60);
            if (minutesSince6AM >= 0) {
                const top = (minutesSince6AM / 60) * timeSlotHeight;
                const indicator = document.createElement('div');
                indicator.className = 'current-time-indicator';
                indicator.style.top = `${top}px`;
                column.appendChild(indicator);
            }
        }
    }

    updateViewControls() {
        this.dom.dayViewBtn.classList.toggle('!bg-purple-600', this.calendarManager.view === 'day');
        this.dom.dayViewBtn.classList.toggle('!text-white', this.calendarManager.view === 'day');
        this.dom.weekViewBtn.classList.toggle('!bg-purple-600', this.calendarManager.view === 'week');
        this.dom.weekViewBtn.classList.toggle('!text-white', this.calendarManager.view === 'week');
    }

    bindCalendarInteractions() {
        this.dom.calendarContainer.querySelectorAll('.day-column').forEach(col => {
            col.addEventListener('dragover', e => e.preventDefault());
            col.addEventListener('drop', e => {
                e.preventDefault();
                const itemId = e.dataTransfer.getData('text/plain');
                if (!itemId) return;
                
                const date = col.dataset.date;
                const rect = col.getBoundingClientRect();
                const hour = 6 + (e.clientY - rect.top) / 60;
                const startHour = Math.floor(hour) + (Math.round((hour % 1) * 2) / 2);
                const format = h => `${String(Math.floor(h)).padStart(2,'0')}:${String((h%1)*60).padStart(2,'0')}`;

                this.taskManager.scheduleEvent({
                    itemId: itemId,
                    date,
                    startTime: format(startHour),
                    endTime: format(startHour + 1),
                });
                document.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Evento programado' } }));
            });
        });
    }
    
// En CalendarUIManager.js

    onCalendarMouseDown(e, instanceId) {
        e.preventDefault();
        e.stopPropagation();
        const eventEl = e.currentTarget;
        const startY = e.clientY;
        const startX = e.clientX; // AÑADIDO: Guardar X inicial
        const initialTop = eventEl.offsetTop;
        const initialHeight = eventEl.offsetHeight;
        let mode = 'move';

        if (e.target.classList.contains('resize-handle')) {
            mode = e.target.classList.contains('top') ? 'resize-top' : 'resize-bottom';
        }

        this.calendarInteraction = {
            instanceId,
            element: eventEl,
            startY,
            startX, // AÑADIDO
            initialTop,
            initialHeight,
            mode
        };
        eventEl.classList.add(mode === 'move' ? 'dragging' : 'resizing');
    }

// En CalendarUIManager.js

    onCalendarMouseMove(e) {
        if (!this.calendarInteraction.element) return;
        e.preventDefault();

        // AÑADIDO: startX
        const { element, startX, startY, initialTop, initialHeight, mode } = this.calendarInteraction;
        const dx = e.clientX - startX; // AÑADIDO: Calcular delta X
        const dy = e.clientY - startY;
        const timeSlotHeight = 60;
        const gridStep = timeSlotHeight / 2; // Para ajustar el tamaño a intervalos de 30 min

        if (mode === 'move') {
            // MODIFICADO: Mover en X e Y
            element.style.transform = `translate(${dx}px, ${dy}px)`;
        } else if (mode === 'resize-bottom') {
            const newHeight = Math.max(gridStep, initialHeight + dy);
            element.style.height = `${Math.round(newHeight / gridStep) * gridStep}px`;
        } else if (mode === 'resize-top') {
            const newTop = initialTop + dy;
            const newHeight = initialHeight - dy;
            if (newHeight >= gridStep) {
                element.style.top = `${Math.round(newTop / gridStep) * gridStep}px`;
                element.style.height = `${Math.round(newHeight / gridStep) * gridStep}px`;
            }
        }
    }
// En CalendarUIManager.js

// REEMPLAZA la función onCalendarMouseUp existente con esta:
    onCalendarMouseUp(e) {
        const { instanceId, element } = this.calendarInteraction;
        if (!element) return;

        element.classList.remove('dragging', 'resizing');

        // Usamos WebKitCSSMatrix para obtener los valores de la transformación
        const transform = new WebKitCSSMatrix(element.style.transform);
        element.style.transform = ''; // Limpiamos la transformación visual

        const timeSlotHeight = 60;
        // Calculamos la nueva posición vertical y la nueva hora
        const newTop = element.offsetTop + transform.m42; // m42 es el valor de translateY
        const newHeight = element.offsetHeight;

        // Ajustamos la hora a intervalos de 15 minutos para que sea más preciso
        const startMinutes = Math.max(0, (newTop / timeSlotHeight) * 60);
        const durationMinutes = (newHeight / timeSlotHeight) * 60;

        const newStartHour = 6 + Math.floor(startMinutes / 60);
        const newStartMinute = Math.round((startMinutes % 60) / 15) * 15 % 60;

        const endTotalMinutes = startMinutes + durationMinutes;
        const newEndHour = 6 + Math.floor(endTotalMinutes / 60);
        const newEndMinute = Math.round((endTotalMinutes % 60) / 15) * 15 % 60;

        const format = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        const updateData = {
            startTime: format(newStartHour, newStartMinute),
            endTime: format(newEndHour, newEndMinute),
        };

        // Buscamos la columna de destino para obtener la nueva fecha
        const column = e.target.closest('.day-column');
        if (column && column.dataset.date) {
            updateData.date = column.dataset.date;
        }

        // Actualizamos el evento a través del TaskManager
        this.taskManager.updateScheduledEvent(instanceId, updateData);

        this.calendarInteraction = {};

        // Forzamos una renderización para asegurar que el evento se mueva al DOM correcto.
        // Es posible que tu TaskManager ya emita un evento que provoque esto.
        // Si es así, esta línea puede ser opcional, pero no hace daño.
        this.render();
    }

    downloadCalendarAsPDF() {
        document.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'Generando PDF...' } }));
        const calendarEl = document.getElementById('calendar-section');
        const { jsPDF } = window.jspdf;

        html2canvas(calendarEl, {
            backgroundColor: '#111015',
            scale: 2
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('calendario.pdf');
            document.dispatchEvent(new CustomEvent('showToast', { detail: { message: 'PDF Descargado' } }));
        });
    }
}
