## 📁 app.js

### 1. `DOMContentLoaded` Event Listener
**Estructuras de Datos usadas:**
- **Object (instancias de clases)** → para manejar lógica (`StorageManager`, `TaskManager`, `CalendarManager`) y UI (`SidebarUIManager`, `CalendarUIManager`, `StatsUIManager`).
- **DOM** → para eventos globales (`dataChanged`, `viewChanged`, `dateChanged`).

**Complejidad temporal:** O(1) — inicialización con número fijo de pasos.

**Descripción resumida:** Punto de entrada de la app; crea instancias, conecta módulos y arranca la interfaz.

---

## 📁 CalendarUIManager.js

### 1. `constructor(taskManager, calendarManager)`
**Estructuras de Datos usadas:**
- **Object** → para almacenar dependencias (`taskManager`, `calendarManager`).
- **Object literal** → `calendarInteraction` para el estado de interacción.

**Complejidad temporal:** O(1).

**Descripción resumida:** Inicializa dependencias y estado para interacciones del calendario.

---

### 2. `init()`
**Estructuras de Datos usadas:**
- **DOM** → para cachear elementos y asignar eventos.

**Complejidad temporal:** O(1).

**Descripción resumida:** Configura referencias de DOM, listeners y renderiza la vista inicial.

---

### 3. `cacheDOM()`
**Estructuras de Datos usadas:**
- **DOM** → referencias a elementos HTML mediante `getElementById`.

**Complejidad temporal:** O(1).

**Descripción resumida:** Guarda referencias a los elementos del calendario para uso interno.

---

### 4. `bindEventListeners()`
**Estructuras de Datos usadas:**
- **DOM** → listeners de clic en botones y eventos globales de ratón.

**Complejidad temporal:** O(1).

**Descripción resumida:** Conecta los elementos del DOM con sus controladores de evento.

---

### 5. `render()`
**Estructuras de Datos usadas:**
- **Array** → lista de fechas `dates`.
- **DOM** → generación dinámica de elementos y contenido.

**Complejidad temporal:** O(d) donde *d* es el número de días en vista.

**Descripción resumida:** Dibuja la cuadrícula del calendario y coloca los eventos según la vista seleccionada.

---

### 6. `renderScheduledEvents()`
**Estructuras de Datos usadas:**
- **Object (Hash Map)** → `scheduledEvents` desde `TaskManager`.
- **Array** → resultado de `split`/`map` para manejar horas.
- **DOM** → creación y estilo de elementos de evento.

**Complejidad temporal:** O(e) donde *e* es el número de eventos programados.

**Descripción resumida:** Inserta eventos en las columnas correspondientes, con su hora y estilo.

---

### 7. `renderCurrentTimeIndicator()`
**Estructuras de Datos usadas:**
- **DOM** → para buscar y añadir línea indicadora.
- **Date** → para obtener hora actual.

**Complejidad temporal:** O(1).

**Descripción resumida:** Muestra una línea roja en la hora actual del día activo.

---

### 8. `updateViewControls()`
**Estructuras de Datos usadas:**
- **DOM** → cambio de clases CSS en botones.

**Complejidad temporal:** O(1).

**Descripción resumida:** Resalta el botón correspondiente a la vista activa.

---

### 9. `bindCalendarInteractions()`
**Estructuras de Datos usadas:**
- **DOM NodeList (Array-like)** → columnas del calendario.
- **DOM** → listeners para drag & drop.

**Complejidad temporal:** O(c) donde *c* es el número de columnas.

**Descripción resumida:** Habilita programación de eventos arrastrando ítems al calendario.

---

### 10. `onCalendarMouseDown(e, instanceId)`
**Estructuras de Datos usadas:**
- **Object** → estado `calendarInteraction`.

**Complejidad temporal:** O(1).

**Descripción resumida:** Detecta inicio de arrastre o redimensionado de un evento.

---

### 11. `onCalendarMouseMove(e)`
**Estructuras de Datos usadas:**
- **Object** → `calendarInteraction`.
- **DOM** → aplicación de `transform` y cambios de tamaño.

**Complejidad temporal:** O(1) por evento, pero ejecutado muchas veces durante arrastre.

**Descripción resumida:** Ajusta visualmente la posición/tamaño del evento en tiempo real.

---

### 12. `onCalendarMouseUp(e)`
**Estructuras de Datos usadas:**
- **Object** → `calendarInteraction`.
- **DOM** → para identificar columna y fecha.
- **String** → formato de horas.

**Complejidad temporal:** O(1).

**Descripción resumida:** Finaliza interacción, actualiza datos del evento y vuelve a renderizar.

---

### 13. `downloadCalendarAsPDF()`
**Estructuras de Datos usadas:**
- **DOM** → captura de sección del calendario.
- **Canvas** → a través de `html2canvas`.
- **Object PDF** → `jsPDF`.

**Complejidad temporal:** O(A) donde *A* es el área en píxeles de renderizado.

**Descripción resumida:** Exporta el calendario visible como PDF.

---

## 📁 StorageManager.js

### 1. `constructor()`
**Estructuras de Datos usadas:**
- **Object literal** → `this.KEYS` con claves de almacenamiento.

**Complejidad temporal:** O(1).

**Descripción resumida:** Define claves para guardar tareas y eventos en `localStorage`.

---

### 2. `getFromStorage(key, defaultValue)`
**Estructuras de Datos usadas:**
- **String** → datos serializados en `localStorage`.
- **Array** → lista de tareas.
- **Object (Hash Map)** → programación de eventos.
- **forEach** y **for...in** → para compatibilidad con formatos antiguos.

**Complejidad temporal:**  
- O(t) si es lista de tareas.  
- O(e) si es lista de eventos.  

**Descripción resumida:** Recupera y deserializa datos, adaptando versiones antiguas al formato actual.

---

### 3. `saveToStorage(key, value)`
**Estructuras de Datos usadas:**
- **String** → datos serializados JSON.

**Complejidad temporal:** O(1).

**Descripción resumida:** Serializa y guarda un valor en `localStorage`.

---

### 4. `getTasks()`
**Estructuras de Datos usadas:**
- **Array** → lista de tareas.

**Complejidad temporal:** O(t).

**Descripción resumida:** Obtiene tareas usando la clave configurada.

---

### 5. `saveTasks(tasks)`
**Estructuras de Datos usadas:**
- **Array** → lista de tareas.

**Complejidad temporal:** O(1).

**Descripción resumida:** Guarda la lista completa de tareas.

---

### 6. `getSchedule()`
**Estructuras de Datos usadas:**
- **Object (Hash Map)** → programación de eventos.

**Complejidad temporal:** O(e).

**Descripción resumida:** Recupera programación de eventos desde `localStorage`.

---

### 7. `saveSchedule(schedule)`
**Estructuras de Datos usadas:**
- **Object (Hash Map)** → programación de eventos.

**Complejidad temporal:** O(1).

**Descripción resumida:** Guarda la programación completa de eventos.
