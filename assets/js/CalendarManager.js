/**
 * CalendarManager.js
 * * Responsabilidad Única: Gestionar la lógica y el estado del calendario.
 */
class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.view = 'week'; // 'week' o 'day'
    }

    setView(newView) {
        this.view = newView;
        document.dispatchEvent(new CustomEvent('viewChanged'));
    }

    navigate(direction) {
        const increment = direction === 'prev' ? -1 : 1;
        if (this.view === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (7 * increment));
        } else { // 'day'
            this.currentDate.setDate(this.currentDate.getDate() + increment);
        }
        document.dispatchEvent(new CustomEvent('dateChanged'));
    }

    goToToday() {
        this.currentDate = new Date();
        document.dispatchEvent(new CustomEvent('dateChanged'));
    }

    _getStartOfWeek(d) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
        date.setHours(0, 0, 0, 0);
        return new Date(date.setDate(diff));
    }

    getViewData() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (this.view === 'day') {
            const date = new Date(this.currentDate);
            date.setHours(0, 0, 0, 0);
            return {
                dates: [date],
                rangeText: date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                today,
            };
        }
        
        const start = this._getStartOfWeek(this.currentDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            return date;
        });

        const rangeText = `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        
        return { dates, rangeText, today };
    }
}
