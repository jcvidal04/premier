const JSON_PATH = '/api/equipos'; // Ruta al endpoint de equipos en tu servidor

class Buscar {
    constructor() {
        this.onSubmit = this.onSubmit.bind(this);
        const form = document.querySelector("#searchForm");
        form.addEventListener("submit", this.onSubmit);
    }

    loadEquipos() {
        return fetch(JSON_PATH)
            .then(this.onResponse)
            .then(json => json.equipos)
            .catch(error => console.error('Error al cargar los datos de los equipos:', error));
    }

    onSubmit(event) {
        event.preventDefault();
        const equipoName = document.querySelector("#equipoName").value.toLowerCase();
        this.loadEquipos().then(equipos => {
            const equipoEncontrado = equipos.find(equipo => 
                equipo.nombre && equipo.nombre.toLowerCase() === equipoName
            );
            this.mostrarResultado(equipoEncontrado);
        });
    }

    mostrarResultado(equipo) {
        const equiposContainer = document.querySelector("#equiposContainer");
        equiposContainer.innerHTML = "";

        if (equipo) {
            // Card for basic team information
            const equipoInfo = document.createElement('div');
            equipoInfo.classList.add('card');
            equipoInfo.innerHTML = `
                <div class="card-header">
                    <img src="${equipo.imagenEscudo}" alt="${equipo.nombre} Escudo" class="escudo-equipo">
                    <h2>${equipo.nombreCompleto}</h2>
                </div>
                <div class="card-body">
                    <p><strong>Posición:</strong> ${equipo.posicion} ${equipo.posicion === 1 ? '🏆' : ''}</p>
                    <p><strong>Apodo:</strong> ${equipo.apodo}</p>
                    <p><strong>Fecha de Creación:</strong> ${equipo.fechaCreacion}</p>
                    <p><strong>Estadio:</strong> ${equipo.estadio}</p>
                    <p><strong>Entrenador:</strong> ${equipo.entrenador}</p>
                    <p><strong>Próxima Temporada:</strong> ${equipo.proximaTemporada}</p>
                </div>
                <div class="button-container">
                    <button class="team-button" data-equipo="${equipo.nombre}">Elegir favorito</button>
                </div>
            `;
            equiposContainer.appendChild(equipoInfo);

            // Card for team statistics and top scorers
            const equipoStats = document.createElement('div');
            equipoStats.classList.add('card');
            equipoStats.innerHTML = `
                <div class="card-header">
                    <h2>Estadísticas del equipo</h2>
                </div>
                <div class="card-body">
                    <table>
                        <tr>
                            <th>PJ</th>
                            <th>PG</th>
                            <th>PE</th>
                            <th>PP</th>
                            <th>Puntos</th>
                            <th>GF</th>
                            <th>GC</th>
                            <th>DF</th>
                        </tr>
                        <tr>
                            <td>${equipo.partidosJugados}</td>
                            <td>${equipo.partidosGanados}</td>
                            <td>${equipo.partidosEmpatados}</td>
                            <td>${equipo.partidosPerdidos}</td>
                            <td>${equipo.puntos}</td>
                            <td>${equipo.golesFavor}</td>
                            <td>${equipo.golesContra}</td>
                            <td>${equipo.diferenciaGoles}</td>
                        </tr>
                    </table>
                    <h2 class="goleadores-h2">Goleadores del equipo</h2>
                    <table class="goleadores-table">
                        <tr>
                            <th>Goleador</th>
                            <th>Goles</th>
                        </tr>
                        ${equipo.goleadores.map(goleador => `
                            <tr>
                                <td>${goleador.nombre}</td>
                                <td>${goleador.goles}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            `;
            equiposContainer.appendChild(equipoStats);

            // Event listener for selecting favorite team
            const teamButton = equipoInfo.querySelector('.team-button');
            teamButton.addEventListener('click', () => this.guardarFavorito(equipo.nombre));
        } else {
            equiposContainer.innerHTML = '<p class="no_encontrado">No se encontraron equipos.</p>';
        }
    }

    guardarFavorito(nombreEquipo) {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ equipoFavorito: nombreEquipo })
        };

        fetch('/api/favorite', fetchOptions)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Mostrar alerta de SweetAlert2
                    Swal.fire({
                        icon: 'success',
                        title: '¡Equipo favorito actualizado!',
                        text: `Has elegido a ${nombreEquipo} como tu equipo favorito.`,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        // Limpiar el formulario de búsqueda después de confirmar la alerta
                        document.querySelector("#equipoName").value = '';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un problema al actualizar tu equipo favorito.'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al actualizar tu equipo favorito. Por favor, intenta de nuevo.'
                });
            });
    }

    onResponse(response) {
        return response.json();
    }
}

const buscar = new Buscar();
