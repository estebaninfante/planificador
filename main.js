
// main.js
// --- JS extraído de index.html ---

// Devuelve el inicio de la semana (domingo) para una fecha dada
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (domingo) - 6 (sábado)
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day);
    return d;
}

// Auxiliary functions for localStorage
const STORAGE_KEY_TASKS = 'timeManagementApp_tasks_v4';
const STORAGE_KEY_SCHEDULE = 'timeManagementApp_schedule_v4';

function getStoredTasks() {
    try {
        const tasks = localStorage.getItem(STORAGE_KEY_TASKS);
        return tasks ? JSON.parse(tasks) : [];
    } catch (e) {
        console.error("Error loading tasks from localStorage:", e);
        return [];
    }
}
function setStoredTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
        console.error("Error saving tasks to localStorage:", e);
    }
}
function getStoredSchedule() {
    try {
        const schedule = localStorage.getItem(STORAGE_KEY_SCHEDULE);
        return schedule ? JSON.parse(schedule) : {};
    } catch (e) {
        console.error("Error loading schedule from localStorage:", e);
        return {};
    }
}
function setStoredSchedule(schedule) {
    try {
        localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
        console.error("Error saving schedule to localStorage:", e);
    }
}

// Application state
let tasks = getStoredTasks();
let scheduledTasks = getStoredSchedule();
let currentWeekStart = getStartOfWeek(new Date());
let currentView = 'week';

// DOM references (set on DOMContentLoaded)
let taskListDiv, calendarDiv, currentWeekRangeSpan, prevWeekBtn, nextWeekBtn, overlapAlert, weeklyStatsDiv, clearDataBtn;
let batchTaskInput, addBatchTasksBtn;
let suggestAITasksBtn, aiLoadingSpinner, aiButtonText;
let weekViewBtn, dayViewBtn;
let confirmModal, cancelClearBtn, confirmClearBtn;
let quickAddTaskModal, quickAddTaskInput;
let detailedAddTaskModal, detailedModalTitle, detailedTaskForm, detailedTaskIdInput, detailedTaskNameInput, detailedTaskPriorityInput, detailedTaskTypeInput, detailedTaskSubjectCategoryInput, detailedTaskRecurrentInput, detailedAssignToDaySelect, detailedAssignStartDaySelect, detailedAssignEndDaySelect, detailedAssignStartHourSelect, detailedAssignEndHourSelect, detailedTaskNotesInput, detailedSubtasksList, detailedNewSubtaskInput, detailedAddSubtaskBtn, detailedSubtaskCount, detailedTaskSubjectDisplay, deleteDetailedTaskBtn;
let editScheduledTaskModal, editScheduledModalTitle, editScheduledTaskForm, editScheduledTaskIdInput, editScheduledTaskOriginalInstanceIdInput, editScheduledTaskNameInput, editScheduledTaskPriorityInput, editScheduledTaskTypeInput, editScheduledTaskSubjectCategoryInput, editScheduledTaskRecurrentInput, editScheduledAssignToDaySelect, editScheduledAssignStartDaySelect, editScheduledAssignEndDaySelect, editScheduledAssignStartHourSelect, editScheduledAssignEndHourSelect, editScheduledTaskNotesInput, editScheduledSubtasksList, editScheduledNewSubtaskInput, editScheduledAddSubtaskBtn, editScheduledSubtaskCount, editScheduledTaskSubjectDisplay, deleteScheduledTaskFromModalBtn;
let detailedAddTaskBtn;

// Enum Options
const priorityOptions = ['Baja', 'Media', 'Alta'];
const typeOptions = ['Otro', 'Clase', 'Tarea', 'Lectura/Repaso', 'Examen'];
const subjectCategoryOptions = ['Otro', 'Cálculo', 'Microeconomía', 'Programación', 'Historia', 'Literatura', 'Arte', 'Ciencias', 'Deportes', 'Personal'];

// Helper to populate select options
function populateSelect(selectElement, options, selectedValue = '') {
    selectElement.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        if (option === selectedValue) opt.selected = true;
        selectElement.appendChild(opt);
    });
}
function populateTimeOptions(selectElement, selectedHour = null, selectedMinute = null) {
    selectElement.innerHTML = '<option value="">Seleccionar</option>';
    for (let i = 6; i <= 22; i++) {
        for (let m = 0; m < 60; m += 30) {
            const hour = i.toString().padStart(2, '0');
            const min = m.toString().padStart(2, '0');
            const value = `${hour}:${min}`;
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = value;
            if (selectedHour !== null && selectedMinute !== null && i === selectedHour && m === selectedMinute) opt.selected = true;
            selectElement.appendChild(opt);
        }
    }
}
function populateAllSelects() {
    populateSelect(detailedTaskPriorityInput, priorityOptions);
    populateSelect(detailedTaskTypeInput, typeOptions);
    populateSelect(detailedTaskSubjectCategoryInput, subjectCategoryOptions);
    populateTimeOptions(detailedAssignStartHourSelect);
    populateTimeOptions(detailedAssignEndHourSelect);
    // ...otros selects si es necesario...
}

// --- INICIALIZACIÓN SEGURA DE EVENTOS Y LÓGICA ---
document.addEventListener('DOMContentLoaded', function() {
    // Si no hay tareas ni eventos programados, agrega uno de ejemplo
    if (tasks.length === 0 && Object.keys(scheduledTasks).length === 0) {
        const exampleTask = {
            id: generateUniqueId(),
            name: 'Ejemplo: Clase de Matemáticas',
            priority: 'Alta',
            type: 'Clase',
            subjectCategory: 'Cálculo',
            notes: 'Aula 101',
            recurrent: false,
            startHour: '10:00',
            endHour: '12:00'
        };
        tasks.push(exampleTask);
        setStoredTasks(tasks);
        // Programa el evento para el miércoles de la semana actual
        const weekStart = getStartOfWeek(new Date());
        const wednesday = new Date(weekStart);
        wednesday.setDate(weekStart.getDate() + 3); // Miércoles
        const instanceId = generateUniqueId();
        scheduledTasks[instanceId] = {
            taskId: exampleTask.id,
            date: wednesday.toISOString().slice(0, 10),
            startHour: '10:00',
            endHour: '12:00',
            priority: 'Alta',
            type: 'Clase',
            subjectCategory: 'Cálculo'
        };
        setStoredSchedule(scheduledTasks);
    }

    console.log('[DEBUG] DOMContentLoaded');
    // Asignar referencias DOM
    taskListDiv = document.getElementById('task-list');
    calendarDiv = document.getElementById('calendar');
    currentWeekRangeSpan = document.getElementById('current-week-range');
    prevWeekBtn = document.getElementById('prev-week-btn');
    nextWeekBtn = document.getElementById('next-week-btn');
    overlapAlert = document.getElementById('overlap-alert');
    weeklyStatsDiv = document.getElementById('weekly-stats');
    clearDataBtn = document.getElementById('clear-data-btn');
    batchTaskInput = document.getElementById('batch-task-input');
    addBatchTasksBtn = document.getElementById('add-batch-tasks-btn');
    suggestAITasksBtn = document.getElementById('suggest-ai-tasks-btn');
    aiLoadingSpinner = document.getElementById('ai-loading-spinner');
    aiButtonText = document.getElementById('ai-button-text');
    weekViewBtn = document.getElementById('week-view-btn');
    dayViewBtn = document.getElementById('day-view-btn');
    confirmModal = document.getElementById('confirm-modal');
    cancelClearBtn = document.getElementById('cancel-clear-btn');
    confirmClearBtn = document.getElementById('confirm-clear-btn');
    quickAddTaskModal = document.getElementById('quick-add-task-modal');
    quickAddTaskInput = document.getElementById('quick-add-task-input');
    detailedAddTaskModal = document.getElementById('detailed-add-task-modal');
    detailedModalTitle = document.getElementById('detailed-modal-title');
    detailedTaskForm = document.getElementById('detailed-task-form');
    detailedTaskIdInput = document.getElementById('detailed-task-id');
    detailedTaskNameInput = document.getElementById('detailed-task-name');
    detailedTaskPriorityInput = document.getElementById('detailed-task-priority');
    detailedTaskTypeInput = document.getElementById('detailed-task-type');
    detailedTaskSubjectCategoryInput = document.getElementById('detailed-task-subject-category');
    detailedTaskRecurrentInput = document.getElementById('detailed-task-recurrent');
    detailedAssignToDaySelect = document.getElementById('detailed-assign-to-day');
    detailedAssignStartDaySelect = document.getElementById('detailed-assign-start-day');
    detailedAssignEndDaySelect = document.getElementById('detailed-assign-end-day');
    detailedAssignStartHourSelect = document.getElementById('detailed-assign-start-hour');
    detailedAssignEndHourSelect = document.getElementById('detailed-assign-end-hour');
    detailedTaskNotesInput = document.getElementById('detailed-task-notes');
    detailedSubtasksList = document.getElementById('subtasks-list');
    detailedNewSubtaskInput = document.getElementById('new-subtask-input');
    detailedAddSubtaskBtn = document.getElementById('add-subtask-btn');
    detailedSubtaskCount = document.getElementById('subtask-count');
    detailedTaskSubjectDisplay = document.getElementById('detailed-task-subject-display');
    deleteDetailedTaskBtn = document.getElementById('delete-detailed-task-btn');
    detailedAddTaskBtn = document.getElementById('detailed-add-task-btn');
    // ...otros elementos si es necesario...

    // LOG de referencias DOM
    console.log('[DEBUG] Referencias DOM:', {
        taskListDiv, calendarDiv, currentWeekRangeSpan, prevWeekBtn, nextWeekBtn, overlapAlert, weeklyStatsDiv, clearDataBtn,
        batchTaskInput, addBatchTasksBtn, suggestAITasksBtn, aiLoadingSpinner, aiButtonText, weekViewBtn, dayViewBtn,
        confirmModal, cancelClearBtn, confirmClearBtn, quickAddTaskModal, quickAddTaskInput, detailedAddTaskModal, detailedModalTitle,
        detailedTaskForm, detailedTaskIdInput, detailedTaskNameInput, detailedTaskPriorityInput, detailedTaskTypeInput,
        detailedTaskSubjectCategoryInput, detailedTaskRecurrentInput, detailedAssignToDaySelect, detailedAssignStartDaySelect,
        detailedAssignEndDaySelect, detailedAssignStartHourSelect, detailedAssignEndHourSelect, detailedTaskNotesInput,
        detailedSubtasksList, detailedNewSubtaskInput, detailedAddSubtaskBtn, detailedSubtaskCount, detailedTaskSubjectDisplay,
        deleteDetailedTaskBtn, detailedAddTaskBtn
    });

    // ALERTA si alguna referencia clave es null
    if (!taskListDiv) alert('No se encontró el div de lista de tareas');
    if (!calendarDiv) alert('No se encontró el div de calendario');
    if (!weekViewBtn || !dayViewBtn) alert('No se encontraron los botones de vista semanal/día');
    if (!addBatchTasksBtn) alert('No se encontró el botón de añadir tareas por lote');

    // Inicializar selects si existen
    if (detailedTaskPriorityInput && detailedTaskTypeInput && detailedTaskSubjectCategoryInput && detailedAssignStartHourSelect && detailedAssignEndHourSelect) {
        console.log('[DEBUG] Inicializando selects');
        populateAllSelects();
    } else {
        console.log('[DEBUG] No se inicializan selects por falta de referencias');
    }

    // UI para botones de días de la semana (toggle) y repeatUntil
    function setupRepeatDayButtons(sectionId, onChange) {
        const container = document.getElementById(sectionId);
        if (!container) return;
        const buttons = container.querySelectorAll('.repeat-day-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                btn.classList.toggle('bg-blue-500');
                btn.classList.toggle('text-white');
                btn.classList.toggle('border-blue-500');
                btn.classList.toggle('font-bold');
                if (onChange) onChange();
            });
        });
    }
    // Mostrar/ocultar sección de repetición según checkbox
    const detailedRepeatSection = document.getElementById('detailed-repeat-section');
    if (detailedTaskRecurrentInput && detailedRepeatSection) {
        detailedTaskRecurrentInput.addEventListener('change', function() {
            detailedRepeatSection.style.display = this.checked ? '' : 'none';
        });
    }
    setupRepeatDayButtons('detailed-repeatOn-buttons');
    setupRepeatDayButtons('batch-repeatOn-buttons');

    // --- LÓGICA PARA EVENTOS RECURRENTES (repeatOn + repeatUntil) ---
    const WEEKDAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    function getRecurringDates(repeatOn, startDate, endDate) {
        const result = [];
        const repeatDaysIdx = repeatOn.map(dia => WEEKDAYS_ES.indexOf(dia));
        let current = new Date(startDate);
        const end = new Date(endDate);
        while (current <= end) {
            if (repeatDaysIdx.includes(current.getDay())) {
                result.push(current.toISOString().slice(0, 10));
            }
            current.setDate(current.getDate() + 1);
        }
        return result;
    }
    function scheduleRecurringTask(task, startDateStr) {
        if (!task.repeatOn || !Array.isArray(task.repeatOn) || !task.repeatUntil) return;
        const today = startDateStr || new Date().toISOString().slice(0, 10);
        const dates = getRecurringDates(task.repeatOn, today, task.repeatUntil);
        dates.forEach(dateStr => {
            const instanceId = generateUniqueId();
            scheduledTasks[instanceId] = {
                taskId: task.id,
                date: dateStr,
                startHour: task.startHour,
                endHour: task.endHour,
                priority: task.priority,
                type: task.type,
                subjectCategory: task.subjectCategory,
                recurrent: true,
                repeatOn: task.repeatOn,
                repeatUntil: task.repeatUntil
            };
        });
        setStoredSchedule(scheduledTasks);
    }
    // Procesa el batch input para soportar repeatOn y repeatUntil
    if (addBatchTasksBtn) {
        addBatchTasksBtn.addEventListener('click', function() {
            let batch;
            try {
                batch = JSON.parse(batchTaskInput.value);
            } catch (e) {
                alert('JSON inválido.');
                return;
            }
            batch.forEach(taskObj => {
                const task = { ...taskObj, id: generateUniqueId() };
                tasks.push(task);
                if (task.recurrent && Array.isArray(task.repeatOn) && task.repeatUntil && task.startHour && task.endHour) {
                    scheduleRecurringTask(task);
                } else if (task.startHour && task.endHour && typeof task.dayOfWeek === 'string') {
                    const today = new Date();
                    const targetDay = WEEKDAYS_ES.indexOf(task.dayOfWeek);
                    let date = new Date(today);
                    while (date.getDay() !== targetDay) date.setDate(date.getDate() + 1);
                    const instanceId = generateUniqueId();
                    scheduledTasks[instanceId] = {
                        taskId: task.id,
                        date: date.toISOString().slice(0, 10),
                        startHour: task.startHour,
                        endHour: task.endHour,
                        priority: task.priority,
                        type: task.type,
                        subjectCategory: task.subjectCategory
                    };
                    setStoredSchedule(scheduledTasks);
                }
            });
            setStoredTasks(tasks);
            renderTasks();
            alert('Tareas añadidas correctamente.');
        });
    }
    // Guardar tarea detallada: soportar recurrencia y color
    if (detailedTaskForm) {
        detailedTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const id = detailedTaskIdInput.value || generateUniqueId();
            const name = detailedTaskNameInput.value;
            const priority = detailedTaskPriorityInput.value;
            const type = detailedTaskTypeInput.value;
            const subjectCategory = detailedTaskSubjectCategoryInput.value;
            const notes = detailedTaskNotesInput.value;
            const recurrent = detailedTaskRecurrentInput.checked;
            let repeatOn = [];
            if (recurrent) {
                document.querySelectorAll('#detailed-repeatOn-buttons .repeat-day-btn.selected').forEach((btn, idx) => {
                    repeatOn.push(btn.dataset.day);
                });
            }
            const repeatUntil = recurrent ? document.getElementById('detailed-repeatUntil').value : null;
            const startHour = detailedAssignStartHourSelect.value;
            const endHour = detailedAssignEndHourSelect.value;
            const colorInput = document.getElementById('detailed-task-color');
            const color = colorInput ? colorInput.value : '#38bdf8';
            let task = tasks.find(t => t.id === id);
            if (!task) {
                task = { id };
                tasks.push(task);
            }
            Object.assign(task, { name, priority, type, subjectCategory, notes, recurrent, repeatOn, repeatUntil, startHour, endHour, color });
            setStoredTasks(tasks);
            if (recurrent && repeatOn.length && repeatUntil && startHour && endHour) {
                scheduleRecurringTask(task);
            }
            renderTasks();
            renderCalendar();
            detailedAddTaskModal.style.display = 'none';
        });
    }
    // --- FUNCIONES AUXILIARES MÍNIMAS Y LOGS DE DEPURACIÓN ---
    function renderTasks() {
        console.log('[renderTasks] Renderizando tareas:', tasks);
        // Renderizado mínimo para depuración
        if (taskListDiv) {
            taskListDiv.innerHTML = '';
            tasks.forEach(task => {
                const div = document.createElement('div');
                div.className = 'task-card';
                div.textContent = task.name || '(Sin nombre)';
                // Modern color: apply color if present
                if (task.color) {
                    div.setAttribute('data-color', task.color);
                    div.style.setProperty('--task-color', task.color);
                }
                taskListDiv.appendChild(div);
            });
        }
    }

    // --- BOTONES DE NAVEGACIÓN DE SEMANA Y CAMBIO DE VISTA ---
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', function() {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            renderCalendar();
        });
    }
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', function() {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            renderCalendar();
        });
    }
    if (weekViewBtn) {
        weekViewBtn.addEventListener('click', function() {
            currentView = 'week';
            weekViewBtn.classList.add('bg-blue-500', 'text-white');
            if (dayViewBtn) dayViewBtn.classList.remove('bg-blue-500', 'text-white');
            renderCalendar();
            console.log('[DEBUG] Cambiada a vista semanal');
        });
    }
    if (dayViewBtn) {
        dayViewBtn.addEventListener('click', function() {
            currentView = 'day';
            dayViewBtn.classList.add('bg-blue-500', 'text-white');
            if (weekViewBtn) weekViewBtn.classList.remove('bg-blue-500', 'text-white');
            renderCalendar();
            console.log('[DEBUG] Cambiada a vista diaria');
        });
    }

    // --- VISTA DIARIA EN CALENDARIO ---
    // Eliminar duplicidad: solo UNA definición de renderCalendar
    // --- NUEVO RENDERIZADO DE CALENDARIO ---
    function renderCalendar() {
        if (!calendarDiv) return;
        calendarDiv.classList.remove('calendar-grid');
        const WEEKDAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const HOURS = Array.from({length: 17}, (_, i) => 6 + i);
        const weekDates = Array.from({length: 7}, (_, i) => {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
        let daysToShow = weekDates;
        let dayHeaders = WEEKDAYS_ES;
        if (currentView === 'day') {
            const now = new Date();
            const todayIdx = now.getDay();
            daysToShow = [weekDates[todayIdx]];
            dayHeaders = [WEEKDAYS_ES[todayIdx]];
        }
        if (currentWeekRangeSpan) {
            const start = weekDates[0];
            const end = weekDates[6];
            currentWeekRangeSpan.textContent = `${start.getDate()}/${start.getMonth()+1}/${start.getFullYear()} - ${end.getDate()}/${end.getMonth()+1}/${end.getFullYear()}`;
        }
        // Renderiza la cuadrícula base como tabla
        let html = '<div class="overflow-x-auto"><table class="w-full border-collapse calendar-table rounded-lg shadow-md bg-white">';
        html += '<thead><tr><th class="border p-2 bg-blue-50"></th>';
        daysToShow.forEach((date, i) => {
            const isToday = date.toDateString() === (new Date()).toDateString();
            html += `<th class="border p-2 bg-blue-50${isToday ? ' text-blue-700 font-bold bg-blue-100' : ''}">${dayHeaders[i]}<br><span class="text-xs">${date.getDate()}/${date.getMonth()+1}</span></th>`;
        });
        html += '</tr></thead><tbody>';
        for (let h = 0; h < HOURS.length; h++) {
            const hour = HOURS[h];
            html += `<tr style="height:48px;"><td class="border p-1 text-xs bg-gray-50 w-16">${hour}:00</td>`;
            for (let d = 0; d < daysToShow.length; d++) {
                html += `<td class="border align-top p-1 min-h-[3rem] bg-white day-slot" data-day-idx="${d}" style="position:relative; height:48px;"></td>`;
            }
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        calendarDiv.innerHTML = html;

        // --- EVENTOS: renderizar como overlays absolutos por día ---
        const table = calendarDiv.querySelector('table');
        daysToShow.forEach((date, dIdx) => {
            const dateStr = date.toISOString().slice(0, 10);
            // Obtener todos los eventos de este día
            let events = Object.entries(scheduledTasks)
                .filter(([id,ev]) => ev.date === dateStr)
                .map(([instanceId, ev]) => {
                    const task = tasks.find(t => t.id === ev.taskId) || {};
                    return {
                        instanceId,
                        ...ev,
                        color: task.color || '#38bdf8',
                        name: task.name || '(Sin título)',
                        notes: task.notes || '',
                        start: parseInt(ev.startHour),
                        end: parseInt(ev.endHour)
                    };
                })
                .sort((a, b) => a.start - b.start || a.end - b.end);
            // --- STACKING: asignar niveles de solapamiento ---
            let levels = [];
            events.forEach(ev => {
                let placed = false;
                for (let l = 0; l < levels.length; l++) {
                    if (!levels[l].some(e2 => !(ev.end <= e2.start || ev.start >= e2.end))) continue;
                    levels[l].push(ev);
                    ev.level = l;
                    placed = true;
                    break;
                }
                if (!placed) {
                    ev.level = levels.length;
                    levels.push([ev]);
                }
            });
            const maxLevel = Math.max(1, levels.length);
            // Renderizar overlays
            events.forEach(ev => {
                const top = (ev.start - 6) * 48; // 48px por hora
                const height = Math.max(1, ev.end - ev.start) * 48;
                const width = 100 / maxLevel;
                const left = ev.level * width;
                let colorAttr = ` data-color="${ev.color}"`;
                let styleAttr = ` style="--task-color: ${ev.color}; top:${top}px; height:${height}px; left:${left}%; width:${width}%; min-height:32px; z-index:2; position:absolute;"`;
                const eventHtml = `<div class="calendar-event" draggable="true" data-instance-id="${ev.instanceId}" title="${ev.notes}"${colorAttr}${styleAttr}>
                    <div class=\"resize-handle top\" data-resize=\"start\"></div>
                    <div class=\"font-semibold text-xs\">${ev.name}</div>
                    <div class=\"text-xs\">${ev.startHour} - ${ev.endHour}</div>
                    ${ev.notes ? `<div class='text-xs'>${ev.notes}</div>` : ''}
                    <div class=\"resize-handle bottom\" data-resize=\"end\"></div>
                </div>`;
                // Insertar en el primer slot de este día (primer td.day-slot del día)
                const slot = table.querySelector(`td.day-slot[data-day-idx='${dIdx}']`);
                if (slot) {
                    slot.insertAdjacentHTML('beforeend', eventHtml);
                }
            });
        });
        // Enlazar drag & drop después de renderizar
        if (typeof setupCalendarDragAndDrop === 'function') setupCalendarDragAndDrop();
    }
});