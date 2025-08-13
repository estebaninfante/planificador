## TODO

1. Que las tareas se "oculten"/ archiven cuando ya estén completadas. 
2. Que al clickar en un evento del calendario, me muestre un modal con toda su información
2.2 Que ese modal tenga la posibilidad de añadir sus propias notas
2.3 Configurar el apartado de los "Cuadernos"

3. Mejorar y añadir más estadísticas.
3.1 En estadísticas, añadir repasos espaciados.

4. Que los eventos no se sobreposicionen entre sí.

5. Separar tareas asignadas, de las sin asignar. 
5.2 Añadir botones de seleccionar varios, y de eliminar. 

6. Que los eventos marcados como importantes, tengan un Glow. 

7. Cambiar navbar.

8. Cambiar de lugar el botón de JSON

9. Mejorar la responsividad de la página.

# Descripción de Funciones y Arquitectura del Código

Este documento detalla la arquitectura y las responsabilidades de cada componente del **Gestor de Tiempo**.  
El proyecto sigue un diseño modular, separando la **lógica de datos**, la **gestión del estado** y la **manipulación de la interfaz de usuario (UI)**.

---

## 📁 app.js
**Responsabilidad:** Punto de entrada principal de la aplicación.  
Su única función es inicializar todos los módulos en el orden correcto y conectarlos entre sí.

- **Evento `DOMContentLoaded`:** Se activa cuando el HTML ha cargado completamente.
- **Inicialización de Módulos:** Crea instancias de todos los gestores (`StorageManager`, `TaskManager`, `CalendarManager`, etc.).
- **Conexión de Eventos:** Establece listeners globales (`dataChanged`, `viewChanged`, `dateChanged`) para que la UI reaccione a cambios en datos o estado.
- **Arranque de la UI:** Llama a `.init()` de los gestores de UI para el primer renderizado.

---

## 📁 assets/js/TaskManager.js
### 🧠 Clase `TaskManager`
**Responsabilidad:** Toda la lógica de negocio y gestión de datos de tareas y eventos (sin conocimiento del DOM).

- `constructor(storageManager)`: Inicializa cargando datos desde `storageManager`.
- `_generateId()`: Genera un ID único para un nuevo ítem.
- `_commit()`: Guarda el estado en `localStorage` y dispara `dataChanged`.
- `getItems()`: Retorna todas las tareas y eventos.
- `getItemById(itemId)`: Busca un ítem por ID. **O(n)**.
- `addItem(itemData)`: Crea y guarda un ítem. **O(1)** (sin contar `_commit`).
- `addBulkItems(items)`: Añade múltiples ítems en lote.
- `updateItem(itemId, updatedData)`: Actualiza un ítem existente.
- `toggleTaskCompletion(taskId)`: Alterna el estado de completado.
- `deleteItems(itemIds)`: Elimina ítems. **O(n)**.
- `getScheduledEvents()`: Retorna los eventos programados.
- `scheduleEvent(eventData)`: Añade un evento al calendario.
- `updateScheduledEvent(instanceId, updatedData)`: Modifica un evento existente.

---

## 📁 assets/js/SidebarUIManager.js
### 🎨 Clase `SidebarUIManager`
**Responsabilidad:** Gestionar interactividad y renderizado de la barra lateral.

- `constructor(taskManager)`: Recibe una instancia de `TaskManager`.
- `init()`: Inicializa la barra lateral.
- `cacheDOM()`: Guarda referencias a elementos del DOM.
- `bindEventListeners()`: Asigna listeners de clic, envío de formularios, etc.
- `render()`: Renderiza la barra lateral llamando a `renderItemLists()`.
- `renderItemLists()`: Filtra, ordena y renderiza ítems por tipo.
- `renderItems(container, items)`: Dibuja ítems en pantalla.
- `createItemCard(item)`: Crea el HTML para una tarjeta.
- `switchTab(tab)`: Cambia entre pestañas.
- `handleQuickAdd(name)`: Añade tarea rápida.
- `handleAddBulk()`: Añade ítems en lote desde JSON.
- `handleFormSubmit(e)`: Crea o actualiza ítems desde el modal.
- `handleDeleteItem()`: Elimina ítem desde el modal.
- `toggleSort(type)`: Cambia criterio de orden.
- `openModal(options)`: Abre modal con datos si es edición.
- `handleCloseModal(e)`: Cierra modal al hacer clic fuera.
- `closeAllModals()`: Cierra todos los modales.
- `showToast(message, type)`: Muestra notificación emergente.

---

## 📁 assets/js/CalendarUIManager.js
### 🎨 Clase `CalendarUIManager`
**Responsabilidad:** Renderizado e interacción del calendario.

- `constructor(taskManager, calendarManager)`: Inicializa.
- `init()`: Configura calendario.
- `cacheDOM()`: Guarda referencias a elementos del calendario.
- `bindEventListeners()`: Listeners para navegación, vista y arrastrar/soltar.
- `render()`: Dibuja cuadrícula y eventos.
- `renderScheduledEvents()`: Posiciona y dibuja eventos.
- `renderCurrentTimeIndicator()`: Línea roja de hora actual.
- `updateViewControls()`: Actualiza botones de vista.
- `bindCalendarInteractions()`: Habilita arrastrar/soltar.
- `onCalendarMouseDown(...)`: Inicia arrastre o redimensionado.
- `onCalendarMouseMove(...)`: Mueve evento mientras se arrastra.
- `onCalendarMouseUp(...)`: Finaliza interacción y guarda cambios.
- `downloadCalendarAsPDF()`: Genera PDF con `html2canvas` y `jspdf`.

---

## 📁 assets/js/CalendarManager.js
### ⚙️ Clase `CalendarManager`
**Responsabilidad:** Estado y lógica interna del calendario (sin acceso al DOM).

- `constructor()`: Fecha actual y vista por defecto (`week`).
- `setView(newView)`: Cambia la vista (`day` o `week`).
- `navigate(direction)`: Cambia fecha.
- `goToToday()`: Vuelve a la fecha actual.
- `_getStartOfWeek(d)`: Calcula lunes de la semana.
- `getViewData()`: Retorna datos para que `CalendarUIManager` renderice.

---

## 📁 assets/js/StatsUIManager.js
### 📊 Clase `StatsUIManager`
**Responsabilidad:** Renderizado de estadísticas.

- `constructor(taskManager, calendarManager)`: Inicializa.
- `init()`: Configura sección de estadísticas.
- `cacheDOM()`: Guarda referencias del DOM.
- `render()`: Calcula y muestra estadísticas (pendientes, completadas, eventos, etc.).

---

## 📁 assets/js/StorageManager.js
### 💾 Clase `StorageManager`
**Responsabilidad:** Abstraer interacción con `localStorage`.

- `constructor()`: Define claves de `localStorage`.
- `getFromStorage(key, defaultValue)`: Obtiene y parsea datos, maneja errores.
- `saveToStorage(key, value)`: Guarda datos en JSON.
- `getTasks()`: Retorna lista de tareas.
- `saveTasks(tasks)`: Guarda lista de tareas.
- `getSchedule()`: Retorna programación de eventos.
- `saveSchedule(schedule)`: Guarda programación de eventos.

# Análisis de Uso de Estructuras de Datos

Este documento desglosa las funciones clave del proyecto que interactúan directamente con las estructuras de datos principales.

Las dos estructuras de datos centrales son:

- **Arreglo (Array):** `this.tasks` en `TaskManager`, que almacena todos los ítems (tareas y eventos) como una lista de objetos.
- **Objeto como Tabla Hash (Hash Map):** `this.scheduledEvents` en `TaskManager`, que almacena instancias de eventos programados usando un ID único como clave para acceso directo.

---

## 📁 assets/js/TaskManager.js

**Clase principal para la gestión de datos.**  
Manipula directamente `this.tasks` (Array) y `this.scheduledEvents` (Object).

### 🧠 Clase `TaskManager`

#### `constructor(storageManager)`
- **Estructura:** Array y Object.
- **Tipo de Dato:** Carga un arreglo de objetos (`this.tasks`) y un objeto de eventos (`this.scheduledEvents`) desde `localStorage`.
- **Operación:** Inicialización / Escritura.

#### `getItems()`
- **Estructura:** Array.
- **Tipo de Dato:** Retorna el arreglo completo de `this.tasks`.
- **Operación:** Lectura.

#### `getItemById(itemId)`
- **Estructura:** Array.
- **Tipo de Dato:** Recorre `this.tasks` para encontrar un ítem por ID.
- **Operación:** Recorrido y Lectura (búsqueda lineal).

#### `addItem(itemData)`
- **Estructura:** Array.
- **Tipo de Dato:** Añade un objeto a `this.tasks`.
- **Operación:** Escritura / Inserción.

#### `addBulkItems(items)`
- **Estructura:** Array.
- **Tipo de Dato:** Itera sobre `items` y los añade a `this.tasks`.
- **Operación:** Escritura / Inserción múltiple.

#### `updateItem(itemId, updatedData)`
- **Estructura:** Array.
- **Tipo de Dato:** Busca y modifica un ítem dentro de `this.tasks`.
- **Operación:** Modificación.

#### `deleteItems(itemIds)`
- **Estructura:** Array y Object.
- **Tipo de Dato:** Filtra `this.tasks` para eliminar ítems y borra claves en `this.scheduledEvents`.
- **Operación:** Eliminación.

#### `getScheduledEvents()`
- **Estructura:** Object (Hash Map).
- **Tipo de Dato:** Retorna `this.scheduledEvents`.
- **Operación:** Lectura.

#### `scheduleEvent(eventData)`
- **Estructura:** Object (Hash Map).
- **Tipo de Dato:** Añade una propiedad en `this.scheduledEvents`.
- **Operación:** Escritura / Inserción.

#### `updateScheduledEvent(instanceId, updatedData)`
- **Estructura:** Object (Hash Map).
- **Tipo de Dato:** Modifica una propiedad existente en `this.scheduledEvents` por clave.
- **Operación:** Modificación.

---

## 📁 assets/js/SidebarUIManager.js

**Clase de consumo de datos** para renderizar la UI, realizando operaciones de lectura y ordenamiento.

### 🎨 Clase `SidebarUIManager`

#### `renderItemLists()`
- **Estructura:** Array.
- **Tipo de Dato:** Recibe y procesa el arreglo de objetos desde `TaskManager`.
- **Operación:** Lectura, recorrido y ordenamiento.  
  Usa `.filter()` para separar tareas/eventos y `.sort()` para ordenarlos según criterios.

---

## 📁 assets/js/StatsUIManager.js

**Clase de consumo de datos** para cálculo y visualización de estadísticas.

### 📊 Clase `StatsUIManager`

#### `render()`
- **Estructura:** Array y Object.
- **Tipo de Dato:** Recibe `this.tasks` y `this.scheduledEvents`.
- **Operación:** Lectura y recorrido.  
  Itera para contar elementos según condiciones (tareas completadas, eventos por semana, etc.).

---

## 📁 assets/js/StorageManager.js

**Capa de abstracción para persistencia de datos** en `localStorage`.

### 💾 Clase `StorageManager`

#### `getFromStorage(key, defaultValue)`
- **Estructura:** String (JSON).
- **Tipo de Dato:** Lee una cadena de texto de `localStorage`.
- **Operación:** Lectura y deserialización (`JSON.parse`) a Array u Object.

#### `saveToStorage(key, value)`
- **Estructura:** Array y Object.
- **Tipo de Dato:** Recibe una estructura de datos.
- **Operación:** Escritura y serialización (`JSON.stringify`) a cadena de texto.

