document.addEventListener('DOMContentLoaded', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }

    function mostrarPantalla(idPantalla) {
        document.querySelectorAll('.vista').forEach(vista => {
            vista.classList.remove('activa');
            vista.classList.add('oculta');
        });
        const destino = document.getElementById(idPantalla);
        destino.classList.remove('oculta');
        destino.classList.add('activa');
    }

    const inputNombre = document.getElementById('nombre-estudiante');
    const errorNombre = document.getElementById('error-nombre');
    const selectCurso = document.getElementById('curso-estudiante');
    const apartadoParalelo = document.getElementById('apartado-paralelo');
    const formVinculacion = document.getElementById('form-vinculacion');

    const contenedorDatos = document.getElementById('datos-guardados');
    const resumenLicencia = document.getElementById('resumen-licencia');
    const btnNuevaLicencia = document.getElementById('btn-nueva-licencia');
    const tabResumen = document.getElementById('tab-resumen');
    const tabRegistroPermisos = document.getElementById('tab-registro-permisos');
    const vistaResumen = document.getElementById('vista-resumen');
    const vistaRegistroPermisos = document.getElementById('vista-registro-permisos');
    const contadorPermisos = document.getElementById('contador-permisos');
    const totalDiasPermiso = document.getElementById('total-dias-permiso');
    const listaPermisosGuardados = document.getElementById('lista-permisos-guardados');
    const visorJustificacion = document.getElementById('visor-justificacion');

    const miniFichaEstudiante = document.getElementById('mini-ficha-estudiante');
    const formLicencia = document.getElementById('form-licencia');
    const radiosMotivo = document.querySelectorAll('input[name="motivo"]');
    const labelDetalle = document.getElementById('label-detalle-licencia');
    const inputDetalle = document.getElementById('detalle-licencia');
    const errorDetalle = document.getElementById('error-detalle');
    const btnVolverPanel = document.getElementById('btn-volver-panel');

    function obtenerEstudiante() {
        return JSON.parse(localStorage.getItem('passEscolarEstudiante')) || null;
    }

    function obtenerPermisos() {
        return JSON.parse(localStorage.getItem('passEscolarPermisos')) || [];
    }

    function guardarPermisos(permisos) {
        localStorage.setItem('passEscolarPermisos', JSON.stringify(permisos));
    }

    function activarPestanaPanel(pestana) {
        if (pestana === 'registro') {
            tabRegistroPermisos.classList.add('activo');
            tabResumen.classList.remove('activo');
            vistaRegistroPermisos.classList.remove('oculta');
            vistaResumen.classList.add('oculta');
            renderizarRegistroPermisos();
        } else {
            tabResumen.classList.add('activo');
            tabRegistroPermisos.classList.remove('activo');
            vistaResumen.classList.remove('oculta');
            vistaRegistroPermisos.classList.add('oculta');
            visorJustificacion.classList.add('oculta');
        }
    }

    tabResumen.addEventListener('click', () => activarPestanaPanel('resumen'));
    tabRegistroPermisos.addEventListener('click', () => activarPestanaPanel('registro'));

    function renderizarRegistroPermisos() {
        const permisos = obtenerPermisos();
        contadorPermisos.textContent = String(permisos.length);
        totalDiasPermiso.textContent = `${permisos.length} permiso(s) / día(s) registrados`;

        if (permisos.length === 0) {
            listaPermisosGuardados.innerHTML = `
                <p class="sin-permisos">Aún no hay permisos registrados en este historial.</p>
            `;
            return;
        }

        listaPermisosGuardados.innerHTML = permisos.map(p => `
            <article class="item-permiso">
                <div class="item-permiso-top">
                    <span>${p.folio}</span>
                    <span>${p.fechaCorta}</span>
                </div>
                <p><strong>Motivo:</strong> ${p.motivo}</p>
                ${p.detalle ? `<p><strong>Detalle:</strong> ${p.detalle}</p>` : ''}
                <p class="subtexto-mini">Registrado: ${p.fechaHora}</p>
                <button type="button" class="btn-justificacion" data-folio="${p.folio}">
                    Sacar justificación
                </button>
            </article>
        `).join('');

        listaPermisosGuardados.querySelectorAll('.btn-justificacion').forEach(btn => {
            btn.addEventListener('click', () => {
                const permisoElegido = permisos.find(item => item.folio === btn.dataset.folio);
                if (permisoElegido) {
                    mostrarJustificacion(permisoElegido);
                }
            });
        });
    }

    function mostrarJustificacion(permiso) {
        const estudiante = obtenerEstudiante() || {};
        const textoJustificacion = [
            'UNIDAD EDUCATIVA TECNOLÓGICA 25 DE JULIO "B" — PASSESCOLAR',
            'JUSTIFICACIÓN DE PERMISO / AUSENCIA ESCOLAR',
            `Folio: ${permiso.folio}`,
            `Fecha de emisión: ${permiso.fechaHora}`,
            `Estudiante: ${estudiante.estudiante || 'No especificado'}`,
            `Curso y Paralelo: ${estudiante.curso || ''} "${estudiante.paralelo || ''}"`,
            `Representante: ${estudiante.rol || 'No especificado'}`,
            `Motivo: ${permiso.motivo}`,
            `Descripción / Observación: ${permiso.detalle || 'Sin observación adicional.'}`
        ].join('\n');

        visorJustificacion.innerHTML = `
            <p><strong>Justificación — ${permiso.folio}</strong></p>
            <p><strong>Estudiante:</strong> ${estudiante.estudiante || ''}</p>
            <p><strong>Curso y Paralelo:</strong> ${estudiante.curso || ''} "${estudiante.paralelo || ''}" (${estudiante.rol || ''})</p>
            <p><strong>Día / Fecha solicitado:</strong> ${permiso.fechaCorta}</p>
            <p><strong>Motivo:</strong> ${permiso.motivo}</p>
            <p><strong>Justificación / Detalle:</strong> ${permiso.detalle || 'Permiso solicitado según motivo seleccionado.'}</p>
            <div class="acciones-justificacion">
                <button type="button" id="btn-copiar-justificacion" class="btn-secundario-mini">
                    Copiar texto
                </button>
                <button type="button" id="btn-imprimir-justificacion" class="btn-secundario-mini">
                    Imprimir / Guardar PDF
                </button>
                <button type="button" id="btn-cerrar-justificacion" class="btn-cerrar-mini">
                    Cerrar
                </button>
            </div>
        `;
        visorJustificacion.classList.remove('oculta');

        document.getElementById('btn-copiar-justificacion').addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(textoJustificacion);
                alert('Justificación copiada al portapapeles.');
            } catch {
                alert('No se pudo copiar automáticamente, puedes seleccionar el texto de la justificación.');
            }
        });

        document.getElementById('btn-imprimir-justificacion').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('btn-cerrar-justificacion').addEventListener('click', () => {
            visorJustificacion.classList.add('oculta');
        });
    }

    function validarNombreCompleto(valor) {
        const limpio = valor.trim().replace(/\s+/g, ' ');
        if (!limpio) {
            return 'Ingresa el nombre completo del estudiante.';
        }
        if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+(?:\s+[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/.test(limpio)) {
            return 'Solo se permiten letras y espacios (sin números ni símbolos).';
        }
        const palabras = limpio.split(' ');
        if (palabras.length < 3) {
            return 'Debe tener al menos 3 palabras (nombre y apellidos).';
        }
        return '';
    }

    inputNombre.addEventListener('input', () => {
        const mensajeError = validarNombreCompleto(inputNombre.value);
        if (inputNombre.value.trim() !== '' && mensajeError) {
            errorNombre.textContent = mensajeError;
            errorNombre.classList.remove('oculta');
            inputNombre.classList.add('input-error');
        } else {
            errorNombre.textContent = '';
            errorNombre.classList.add('oculta');
            inputNombre.classList.remove('input-error');
        }
    });

    selectCurso.addEventListener('change', () => {
        if (selectCurso.value) {
            apartadoParalelo.classList.remove('oculta');
        } else {
            apartadoParalelo.classList.add('oculta');
        }
    });

    document.getElementById('btn-registrar-estudiante').addEventListener('click', () => {
        mostrarPantalla('pantalla-2');
    });

    document.getElementById('btn-cancelar').addEventListener('click', () => {
        formVinculacion.reset();
        apartadoParalelo.classList.add('oculta');
        errorNombre.textContent = '';
        errorNombre.classList.add('oculta');
        inputNombre.classList.remove('input-error');
        mostrarPantalla('pantalla-1');
    });

    formVinculacion.addEventListener('submit', (e) => {
        e.preventDefault();

        const mensajeError = validarNombreCompleto(inputNombre.value);
        if (mensajeError) {
            errorNombre.textContent = mensajeError;
            errorNombre.classList.remove('oculta');
            inputNombre.classList.add('input-error');
            inputNombre.focus();
            return;
        }

        const nombre = inputNombre.value.trim().replace(/\s+/g, ' ');
        const curso = selectCurso.value;
        const paraleloSeleccionado = document.querySelector('input[name="paralelo"]:checked');
        const rolSeleccionado = document.querySelector('input[name="rol"]:checked');

        if (!curso) {
            alert('Por favor, selecciona un curso.');
            return;
        }
        if (!paraleloSeleccionado) {
            alert('Por favor, selecciona el paralelo (A, B o C).');
            return;
        }
        if (!rolSeleccionado) {
            alert('Por favor, selecciona tu parentesco.');
            return;
        }

        const paralelo = paraleloSeleccionado.value;
        const rol = rolSeleccionado.value;

        const datos = { estudiante: nombre, curso, paralelo, rol };
        localStorage.setItem('passEscolarEstudiante', JSON.stringify(datos));

        contenedorDatos.innerHTML = `
            <p><strong>Estudiante:</strong> ${nombre}</p>
            <p><strong>Curso:</strong> ${curso}</p>
            <p><strong>Paralelo:</strong> ${paralelo}</p>
            <p><strong>Representante:</strong> ${rol}</p>
        `;

        renderizarRegistroPermisos();
        activarPestanaPanel('resumen');
        mostrarPantalla('pantalla-3');
    });

    function actualizarRequisitoDescripcion() {
        const seleccionado = document.querySelector('input[name="motivo"]:checked');
        const esOtro = seleccionado && seleccionado.value === 'Otro motivo';

        if (esOtro) {
            labelDetalle.textContent = 'Descripción del motivo (obligatorio para "Otro motivo")';
            inputDetalle.placeholder = 'Explica detalladamente por qué estás pidiendo este permiso...';
        } else {
            labelDetalle.textContent = 'Descripción (opcional)';
            inputDetalle.placeholder = 'Puedes agregar un detalle adicional si lo deseas...';
            errorDetalle.textContent = '';
            errorDetalle.classList.add('oculta');
            inputDetalle.classList.remove('input-error');
        }
    }

    radiosMotivo.forEach(radio => {
        radio.addEventListener('change', actualizarRequisitoDescripcion);
    });

    inputDetalle.addEventListener('input', () => {
        const seleccionado = document.querySelector('input[name="motivo"]:checked');
        if (seleccionado && seleccionado.value === 'Otro motivo' && inputDetalle.value.trim() !== '') {
            errorDetalle.textContent = '';
            errorDetalle.classList.add('oculta');
            inputDetalle.classList.remove('input-error');
        }
    });

    btnNuevaLicencia.addEventListener('click', () => {
        const datosGuardados = obtenerEstudiante() || {};
        miniFichaEstudiante.innerHTML = `
            <strong>Estudiante:</strong> ${datosGuardados.estudiante || 'No registrado'}<br>
            <strong>Curso y Paralelo:</strong> ${datosGuardados.curso || ''} "${datosGuardados.paralelo || ''}" · <strong>${datosGuardados.rol || ''}</strong>
        `;
        formLicencia.reset();
        actualizarRequisitoDescripcion();
        mostrarPantalla('pantalla-4');
    });

    btnVolverPanel.addEventListener('click', () => {
        formLicencia.reset();
        errorDetalle.textContent = '';
        errorDetalle.classList.add('oculta');
        inputDetalle.classList.remove('input-error');
        mostrarPantalla('pantalla-3');
    });

    formLicencia.addEventListener('submit', (e) => {
        e.preventDefault();

        const motivoSeleccionado = document.querySelector('input[name="motivo"]:checked');
        const detalle = inputDetalle.value.trim();

        if (!motivoSeleccionado) {
            alert('Por favor, selecciona un motivo de licencia.');
            return;
        }

        if (motivoSeleccionado.value === 'Otro motivo' && !detalle) {
            errorDetalle.textContent = 'Al elegir "Otro motivo", debes escribir obligatoriamente la descripción del permiso.';
            errorDetalle.classList.remove('oculta');
            inputDetalle.classList.add('input-error');
            inputDetalle.focus();
            return;
        }

        const datosGuardados = obtenerEstudiante() || {};
        const ahora = new Date();
        const folio = 'LIC-' + Math.floor(100000 + Math.random() * 900000);
        const fechaCorta = ahora.toLocaleDateString('es-BO');
        const fechaHora = ahora.toLocaleString('es-BO');

        const nuevoPermiso = {
            folio,
            motivo: motivoSeleccionado.value,
            detalle,
            fechaCorta,
            fechaHora
        };

        const permisosActuales = obtenerPermisos();
        permisosActuales.unshift(nuevoPermiso);
        guardarPermisos(permisosActuales);

        resumenLicencia.innerHTML = `
            <p><strong>Licencia Guardada · Folio ${folio}</strong></p>
            <p><strong>Estudiante:</strong> ${datosGuardados.estudiante || 'Registrado'}</p>
            <p><strong>Curso y Paralelo:</strong> ${datosGuardados.curso || ''} "${datosGuardados.paralelo || ''}"</p>
            <p><strong>Motivo:</strong> ${nuevoPermiso.motivo}</p>
            ${nuevoPermiso.detalle ? `<p><strong>Descripción:</strong> ${nuevoPermiso.detalle}</p>` : ''}
            <p><strong>Fecha:</strong> ${fechaHora}</p>
        `;

        resumenLicencia.classList.remove('oculta');
        renderizarRegistroPermisos();
        formLicencia.reset();
        actualizarRequisitoDescripcion();
        activarPestanaPanel('resumen');
        mostrarPantalla('pantalla-3');
    });

    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        formVinculacion.reset();
        formLicencia.reset();
        apartadoParalelo.classList.add('oculta');
        resumenLicencia.classList.add('oculta');
        visorJustificacion.classList.add('oculta');
        errorNombre.textContent = '';
        errorNombre.classList.add('oculta');
        inputNombre.classList.remove('input-error');
        mostrarPantalla('pantalla-1');
    });
});