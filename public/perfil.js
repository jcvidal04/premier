class Perfil {
    constructor() {
        this.getUserDetails = this.getUserDetails.bind(this);
        this.eliminarEquipoFavorito = this.eliminarEquipoFavorito.bind(this);
        this.mostrarEquipoFav = this.mostrarEquipoFav.bind(this);


        this.userValue = document.getElementById('userValue');
        this.passwordValue = document.getElementById('passwordValue');
        this.equipoFavValue = document.getElementById('equipoFavValue');
        this.eliminar = document.querySelector('.eliminar');
        this.mostrarEquipo = document.querySelector('.mostrarEquipoFav');
        this.equiposContainer = document.getElementById('equiposContainer'); // Verifica que este ID es correcto en tu HTML
        ///
        this.chooseTeamBtn = document.getElementById('chooseTeamBtn');


        this.getUserDetails();
        this.eliminar.addEventListener('click', this.eliminarEquipoFavorito);
        this.mostrarEquipo.addEventListener('click', this.mostrarEquipoFav);
        this.chooseTeamBtn.addEventListener('click', () => {
            window.location.href = 'buscar.html';
        });
    
    }



    getUserDetails() {
        fetch('/userDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            //this.passwordValue.textContent = '•'.repeat(data.password.length);
            this.passwordValue.innerText = '••••••••'
            this.userValue.textContent = data.user;
            this.equipoFavValue.textContent = data.equipoFavorito || 'No hay equipo Favorito';
            
            if(data.equipoFavorito){
                this.eliminar.style.display = 'block';
                this.mostrarEquipo.style.display = 'block';
                this.chooseTeamBtn.style.display = 'none';
            }else{
                this.chooseTeamBtn.style.display = 'block';
                this.eliminar.style.display = 'none';
                this.mostrarEquipo.style.display = 'none';
            }        
        })
        .catch(error => console.error('Error obteniendo datos del usuario:', error));
    }


    eliminarEquipoFavorito(event) {
        fetch('/delete/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(value => {
            if (value.success) {
                this.equipoFavValue.textContent = 'No hay equipo favorito';
                alert('Equipo favorito eliminado exitosamente');
                // Ocultar el contenedor de equipos
                this.equiposContainer.classList.add('hidden');
                this.equiposContainer.innerHTML = '';
                this.eliminar.style.display = 'none';
                this.mostrarEquipo.style.display = 'none';
                this.chooseTeamBtn.style.display = 'block';
            } else {
                alert('No se pudo eliminar el equipo favorito');
            }
        })
        .catch(error => {
            console.error('Error al eliminar equipo favorito:', error);
            alert('Error al eliminar equipo favorito');
        });
    }


    mostrarEquipoFav() {
        const equipoFavorito = this.equipoFavValue.textContent;
        if (equipoFavorito === 'No hay equipo Favorito') {
            alert('No tienes un equipo favorito guardado.');
            return;
        }


        fetch('/api/equipos')
        .then(response => response.json())
        .then(data => {
            const equipos = data.equipos;
            const equipoEncontrado = equipos.find(equipo => equipo.nombre.toLowerCase() === equipoFavorito.toLowerCase());
            this.mostrarResultado(equipoEncontrado);
        })
        .catch(error => console.error('Error obteniendo datos del equipo:', error));
    }


    mostrarResultado(equipo) {
        const equiposContainer = this.equiposContainer;
        equiposContainer.innerHTML = "";
        equiposContainer.classList.remove('hidden'); // Mostrar el contenedor si estaba oculto


        if (equipo) {
            // Información básica del equipo
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
            `;
            equiposContainer.appendChild(equipoInfo);


            // Estadísticas y goleadores del equipo
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
                    <h2 class="goles-h3">Goleadores del equipo</h2>
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
        } else {
            equiposContainer.innerHTML = '<p class="no_encontrado">No se encontró información del equipo favorito.</p>';
        }
    }
}







const perfil = new Perfil();


