const JSON_PATH = '/api/equipos'; // Cambiado para apuntar a tu servidor

class Fixture {
    constructor() {
        this.onJsonReady = this.onJsonReady.bind(this);
        this.sortAsc = this.sortAsc.bind(this);
        this.sortDesc = this.sortDesc.bind(this);
        this.onAlphaClick = this.onAlphaClick.bind(this);
    }

    loadEquipos() {
        fetch(JSON_PATH)
            .then(this.onResponse)
            .then(this.onJsonReady)
            .catch(error => {
                console.error('Error al cargar los datos de los equipos:', error);
            });
    }

onJsonReady(json) {
    this.equiposList = json.equipos; // Asumiendo que el JSON tiene una clave "equipos"
    this.renderTable();

    // Añadir eventos a los botones
    document.getElementById('ascButton').addEventListener('click', this.sortAsc);
    document.getElementById('descButton').addEventListener('click', this.sortDesc);
    const alphaButton = document.querySelector("#alphaButton");
    alphaButton.addEventListener("click", this.onAlphaClick);
}

onResponse(response) {
    return response.json();
}

renderTable() {
    const tableBody = document.querySelector("#tablaEquipos");
    tableBody.innerHTML = ''; // Limpiar la tabla antes de renderizar

    this.equiposList.forEach(equipo => {
        new Equipo(tableBody, equipo);
    });
}

sortAsc() {
    this.equiposList.sort((a, b) => a.posicion - b.posicion);
    this.renderTable();
}

sortDesc() {
    this.equiposList.sort((a, b) => b.posicion - a.posicion);
    this.renderTable();
}
onAlphaClick() {
    this.equiposList.sort((a, b) => {
        if (a.nombre < b.nombre) { return -1; }
        if (a.nombre > b.nombre) { return 1; }
        return 0;
    });
    this.renderTable();
}
  
}

class Equipo {
    constructor(tableBody, equipoData) {
        const row = document.createElement('tr');
        let posicionClass = '';
        if (equipoData.posicion <= 4) {
            posicionClass = "azul";
        } else if (equipoData.posicion === 5 || equipoData.posicion === 6) {
            posicionClass = "naranja";
        } else if (equipoData.posicion === 7) {
            posicionClass = "verde";
        } else if (equipoData.posicion >= 18) {
            posicionClass = "rojo";
        }
        row.innerHTML = `
            <td class="${posicionClass}">${equipoData.posicion}</td>
            <td class="nombre-equipo">
            <img src="${equipoData.imagenEscudo}" alt="${equipoData.nombre} Escudo" class="escudo-equipo">
            ${equipoData.nombre}
            </td>
            <td>${equipoData.partidosJugados}</td>
            <td>${equipoData.partidosGanados}</td>
            <td>${equipoData.partidosEmpatados}</td>
            <td>${equipoData.partidosPerdidos}</td>
            <td>${equipoData.puntos}</td>
            <td>${equipoData.golesFavor}</td>
            <td>${equipoData.golesContra}</td>
            <td>${equipoData.diferenciaGoles}</td>
        `;
        tableBody.append(row);
    }
}

// Instanciación de la clase App y carga de los equipos
document.addEventListener('DOMContentLoaded', () => {
    const fixture = new Fixture();
    fixture.loadEquipos();
});


