
<script setup>
import { ref, computed } from 'vue';

defineProps({
    titulo: String
});

const clave_tareas = 'misTareas';

const nuevaTarea = ref('');
const tareas = ref(cargarTareas());
const filtro = ref('todas');

const cancionesExistentes = ref([]);
const buscarCancion = ref('');
const cargandoCancion = ref(false);
const errorCancion = ref('');
const clienteId = 'f4afe559';

const editandoId = ref(null);
const tituloEditado = ref('');
const tareasExistentes = ref([]);
const cargando = ref(false);
const error = ref('');

const tareasFiltradas = computed(() => {
    if (filtro.value === 'pendientes') {
        return tareas.value.filter(t => !t.completada);
    }

    if (filtro.value === 'completadas') {
        return tareas.value.filter(t => t.completada);
    }

    return tareas.value;
});

const totalPendientes = computed(() => {
    return tareas.value.filter(t => !t.completada).length;
});

const totalCompletadas = computed(() => {
    return tareas.value.filter(t => t.completada).length;
});

function cargarTareas() {
    try {
        const datosGuardados = localStorage.getItem(clave_tareas);
        return datosGuardados ? JSON.parse(datosGuardados) : [];
    } catch (err) {
        console.error('Error al recuperar tareas:', err);
        return [];
    }
}

function guardarTareas() {
    localStorage.setItem(clave_tareas, JSON.stringify(tareas.value));
}

function agregartarea() {
    const titulo = nuevaTarea.value.trim();

    if (titulo === '') return;

    const tarea = {
        id: crypto.randomUUID(),
        titulo: titulo,
        completada: false
    };

    tareas.value.push(tarea);
    nuevaTarea.value = '';

    guardarTareas();
    console.table(tareas.value);
}

function cambiarEstado(id) {
    const tarea = tareas.value.find(t => t.id === id);

    if (tarea) {
        tarea.completada = !tarea.completada;
        guardarTareas();
        console.table(tareas.value);
    }
}

function eliminarTarea(id) {
    tareas.value = tareas.value.filter(t => t.id !== id);

    guardarTareas();

    if (editandoId.value === id) {
        cancelarEdicion();
    }

    console.table(tareas.value);
}

function eliminarTodasTareas() {
    tareas.value = [];
    guardarTareas();
    cancelarEdicion();
    console.table(tareas.value);
}

function modificarTarea(tarea) {
    editandoId.value = tarea.id;
    tituloEditado.value = tarea.titulo;
}

function guardarCambios(id) {
    const titulo = tituloEditado.value.trim();

    if (titulo === '') return;

    const tarea = tareas.value.find(t => t.id === id);

    if (tarea) {
        tarea.titulo = titulo;
    }

    guardarTareas();

    editandoId.value = null;
    tituloEditado.value = '';

    console.table(tareas.value);
}

function cancelarEdicion() {
    editandoId.value = null;
    tituloEditado.value = '';
}

// API DE TAREAS JSONPLACEHOLDER

async function obtenerDatos() {
    try {
        cargando.value = true;
        error.value = '';

        const respuesta = await fetch(
            'https://jsonplaceholder.typicode.com/todos?_limit=5'
        );

        if (!respuesta.ok) {
            throw new Error('No se pudieron obtener los datos');
        }

        const datos = await respuesta.json();
        tareasExistentes.value = datos;

        console.table(datos);

    } catch (err) {
        console.error('Error al obtener las tareas:', err);
        error.value = 'No se pudieron cargar las tareas.';
    } finally {
        cargando.value = false;
    }
}

function importarTareas() {
    const tareasConvertidas = tareasExistentes.value.map(tarea => ({
        id: crypto.randomUUID(),
        titulo: tarea.title,
        completada: tarea.completed
    }));

    tareas.value.push(...tareasConvertidas);

    guardarTareas();
    console.table(tareas.value);
}

// API DE MUSICA JAMENDO

async function obtenerCanciones() {

    if (buscarCancion.value.trim() === '') return;

    cargandoCancion.value = true;
    errorCancion.value = '';
    cancionesExistentes.value = [];

    try {

        const parametros = new URLSearchParams({
            client_id: clienteId,
            format: 'json',
            search: buscarCancion.value.trim(),
            limit: '10',
            include: 'licenses'
        });

        const respuesta = await fetch(
            `https://api.jamendo.com/v3.0/tracks/?${parametros.toString()}`
        );

        if (!respuesta.ok) {
            throw new Error('Error al consultar la API');
        }

        const datos = await respuesta.json();

        if (datos.headers?.status !== 'success') {
            throw new Error('La API no respondió correctamente');
        }

        cancionesExistentes.value = datos.results.filter((cancion) => {
            const licencia = cancion.license_ccurl || '';

            return /creativecommons\.org\/licenses\/(by|by-sa)(\/|$)/i.test(licencia);
        });

        if (cancionesExistentes.value.length === 0) {
            errorCancion.value =
                'No se encontraron canciones con estas licencias.';
        }

        console.table(cancionesExistentes.value);

    } catch (err) {

        errorCancion.value =
            'No fue posible recuperar las canciones. Intenta nuevamente.';

        console.error(err);

    } finally {

        cargandoCancion.value = false;

    }
}
</script>

<template>
    <div class="max-w-sm w-full rounded-xl overflow-hidden shadow-lg bg-white p-5">

        <div class="px-2 py-4">

            <button
                class="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg w-full mb-2"
                @click="obtenerDatos"
                :disabled="cargando"
            >
                {{ cargando ? 'Cargando...' : '♡ Cargar API' }}
            </button>

            <button
                class="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg w-full mb-2"
                @click="importarTareas()"
                :disabled="tareasExistentes.length === 0"
            >
                Importar la API
            </button>

            <p v-if="error" class="text-red-500 text-sm text-center mb-3">
                {{ error }}
            </p>

            <div class="mb-5 flex flex-wrap gap-2">
                <button
                    v-for="opcion in [
                        { valor: 'todas', texto: 'Todas' },
                        { valor: 'pendientes', texto: 'Pendientes' },
                        { valor: 'completadas', texto: 'Completadas' }
                    ]"
                    :key="opcion.valor"
                    @click="filtro = opcion.valor"
                    :class="[
                        'rounded-lg px-3 py-2 text-sm',
                        filtro === opcion.valor
                            ? 'bg-pink-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                    ]"
                >
                    {{ opcion.texto }}
                </button>
            </div>

            <h1 class="titulo-lettering text-center text-3xl font-bold text-pink-600 mb-6">
                Formulario de tareas
            </h1>

            <p v-if="tareas.length === 0" class="text-gray-500 text-center mb-4">
                No tienes tareas registradas ♡
            </p>

            <p v-else-if="tareasFiltradas.length === 0" class="text-gray-500 text-center mb-4">
                No hay tareas en este filtro ♡
            </p>

            <ul class="space-y-3">
                <li
                    v-for="tarea in tareasFiltradas"
                    :key="tarea.id"
                    class="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-3"
                >
                    <input
                        type="checkbox"
                        :checked="tarea.completada"
                        @change="cambiarEstado(tarea.id)"
                        class="checkbox-tarea w-5 h-5 cursor-pointer shrink-0"
                    />

                    <div class="flex-1 min-w-0">
                        <input
                            v-if="editandoId === tarea.id"
                            v-model="tituloEditado"
                            @keyup.enter="guardarCambios(tarea.id)"
                            class="w-full rounded-md border border-pink-300 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                            type="text"
                            aria-label="Modificar nombre de tarea"
                        />

                        <span
                            v-else
                            class="text-sm text-gray-700 break-words"
                            :class="{ completada: tarea.completada }"
                        >
                            {{ tarea.titulo }}
                        </span>

                        <p class="text-xs text-gray-500 mt-1">
                            {{ tarea.completada ? 'Completada' : 'Pendiente' }}
                        </p>
                    </div>

                    <template v-if="editandoId === tarea.id">
                        <button
                            type="button"
                            @click="guardarCambios(tarea.id)"
                            class="text-green-600 hover:text-green-800 font-bold text-xl shrink-0"
                            aria-label="Guardar cambios"
                            title="Guardar"
                        >
                            ✓
                        </button>

                        <button
                            type="button"
                            @click="cancelarEdicion"
                            class="text-gray-500 hover:text-gray-700 font-bold text-xl shrink-0"
                            aria-label="Cancelar edición"
                            title="Cancelar"
                        >
                            ×
                        </button>
                    </template>

                    <template v-else>
                        <button
                            type="button"
                            @click="modificarTarea(tarea)"
                            class="text-pink-500 hover:text-pink-700 hover:bg-pink-100 rounded-full w-8 h-8 flex items-center justify-center shrink-0 transition-colors"
                            aria-label="Modificar tarea"
                            title="Modificar"
                        >
                            ✎
                        </button>

                        <button
                            type="button"
                            @click="eliminarTarea(tarea.id)"
                            class="text-pink-500 hover:text-pink-700 hover:bg-pink-100 rounded-full w-8 h-8 text-xl font-bold flex items-center justify-center shrink-0 transition-colors"
                            aria-label="Eliminar tarea"
                            title="Eliminar"
                        >
                            ×
                        </button>
                    </template>
                </li>
            </ul>

        </div>

        <div class="px-2 pt-2 pb-4">
            <span class="inline-block bg-pink-100 rounded-full px-3 py-1 text-sm text-pink-700 mr-2 mb-2">
                #Limpiar el cuarto
            </span>

            <span class="inline-block bg-pink-100 rounded-full px-3 py-1 text-sm text-pink-700 mr-2 mb-2">
                #Subir tarea de programación
            </span>

            <span class="inline-block bg-pink-100 rounded-full px-3 py-1 text-sm text-pink-700 mr-2 mb-2">
                #Hacer ejercicio 5pm
            </span>
        </div>

        <form @submit.prevent="agregartarea" class="px-2">
            <input
                type="text"
                v-model="nuevaTarea"
                placeholder="Escribe una tarea..."
                class="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />

            <button
                type="submit"
                class="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors"
            >
                + Crear tarea
            </button>
        </form>

        <div class="px-2 mt-3">
            <button
                type="button"
                @click="eliminarTodasTareas"
                :disabled="tareas.length === 0"
                class="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg w-full transition-colors"
            >
                Eliminar todas las tareas
            </button>

            <h2 class="text-lg text-pink-600 font-bold mt-5 mb-3">
                Tareas existentes
            </h2>

            <p v-if="tareasExistentes.length === 0" class="text-gray-500 text-sm">
                No hay tareas cargadas.
            </p>

            <ul class="space-y-2">
                <li
                    v-for="tarea in tareasExistentes"
                    :key="tarea.id"
                    class="bg-pink-50 rounded-lg p-3"
                >
                    <p class="text-sm text-gray-700">
                        {{ tarea.id }}. {{ tarea.title }}
                    </p>

                    <p class="text-xs text-gray-500">
                        {{ tarea.completed ? 'Completada' : 'Pendiente' }}
                    </p>
                </li>
            </ul>
        </div>

        <div class="text-gray-600 text-sm mt-4 px-2 text-center space-y-1">
            <p>Tareas registradas: {{ tareas.length }}</p>
            <p>Pendientes: {{ totalPendientes }}</p>
            <p>Completadas: {{ totalCompletadas }}</p>
        </div>

        <!-- SECCION DE MUSICA JAMENDO -->

        <div class="border-t border-pink-200 mt-6 pt-5 px-2">

            <h2 class="text-2xl font-bold text-pink-600 text-center mb-2">
                ♫ Música Jamendo
            </h2>

            <p class="text-gray-500 text-sm text-center mb-4">
                Busca canciones y escucha música desde la API.
            </p>

            <input
                type="text"
                v-model="buscarCancion"
                @keyup.enter="obtenerCanciones"
                placeholder="Busca una canción o artista..."
                class="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />

            <button
                type="button"
                @click="obtenerCanciones"
                :disabled="cargandoCancion || buscarCancion.trim() === ''"
                class="bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg w-full disabled:opacity-50"
            >
                {{ cargandoCancion ? 'Buscando canciones...' : '♫ Consultar canciones API' }}
            </button>

            <p v-if="errorCancion" class="text-red-500 mt-3 text-sm text-center">
                {{ errorCancion }}
            </p>

            <p
                v-if="cargandoCancion"
                class="text-pink-500 text-center text-sm mt-3"
            >
                Buscando música...
            </p>

            <ul class="mt-4 space-y-4">

                <li
                    v-for="cancion in cancionesExistentes"
                    :key="cancion.id"
                    class="border border-pink-200 rounded-lg p-3 bg-pink-50"
                >

                    <div class="flex items-center gap-3">

                        <img
                            :src="cancion.image"
                            :alt="cancion.name"
                            class="w-16 h-16 rounded-lg object-cover"
                        />

                        <div class="min-w-0">
                            <p class="font-bold text-gray-800 break-words">
                                {{ cancion.name }}
                            </p>

                            <p class="text-sm text-gray-500">
                                {{ cancion.artist_name }}
                            </p>

                            <p class="text-xs text-gray-500 mt-1">
                                Duración:
                                {{ Math.floor(cancion.duration / 60) }}:{{
                                    String(cancion.duration % 60).padStart(2, '0')
                                }}
                            </p>
                        </div>

                    </div>

                    <audio
                        v-if="cancion.audio"
                        :src="cancion.audio"
                        controls
                        preload="none"
                        class="w-full mt-3"
                    >
                    </audio>

                    <a
                        :href="cancion.license_ccurl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-pink-600 text-sm underline mt-2 inline-block"
                    >
                        Consultar licencia
                    </a>

                </li>

            </ul>

            <p
                v-if="cancionesExistentes.length > 0"
                class="text-xs text-gray-400 text-center mt-4"
            >
                Música obtenida mediante Jamendo API.
            </p>

        </div>

    </div>
</template>
