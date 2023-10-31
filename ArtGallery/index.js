const SEARCH_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const OBJECT_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

const searchButton = document.querySelector('.btn-search'); 
const searchInput = document.querySelector('.input-search'); 
const resultsContainer = document.getElementById('results');
const searchStatus = document.querySelector('.search-status');
const statusSection = document.getElementById('status-container');

const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');

let query = '';
let data = [];
const filterResultsCache = {};
let visibleImageCount = 0;
let selectedFilters = [];



document.addEventListener('DOMContentLoaded', () => {
    // Coloca aquí el código para agregar el evento de tecla y desplazamiento suave
    searchInput.addEventListener('keypress', (event) => {  
        if (event.key === 'Enter') {
            statusSection.scrollIntoView({ behavior: 'smooth' });
            performSearch();
        }
    });
});


searchButton.addEventListener('click', performSearch); // Click al botón de búsqueda

async function performSearch() {
    query = searchInput.value.trim();

    searchStatus.textContent = 'Loading...';

    filterItems.forEach(item => {
        const checkboxDiv = item.querySelector('.checkbox');
        checkboxDiv.style.backgroundColor = '';
    });

    if (query !== '') {
        const searchURL = `${SEARCH_BASE_URL}?q=${query}`;

        try {
            const response = await fetch(searchURL);
            if (!response.ok) {
                throw new Error('Unable to obtain a valid response from the API');
            }
            const searchData = await response.json();
            data = searchData.objectIDs; // Almacena los resultados en 'data'
            
            if (data === null) {
                searchStatus.innerHTML = `No results found for: "<strong>${query}</strong>". Please try another search term.`;
            } else {
            console.log(data);
            displayResults(data);
            }
        } catch (error) {
            console.error('Error when making the API request.', error);}
    } else {
        console.log('The search field is empty');
    }
}

//PerformSearch2 se utiliza en el manejo de eliminación de filtros. 
//Es igual que la original, solo se elimina el displayResults.
async function performSearch2() {
    // Limpiar resultados anteriores
    resultsContainer.innerHTML = ''; // Limpiar el contenedor de resultados
    data = []; // Reiniciar el array data
    selectedFilters = []; // Reiniciar los filtros seleccionados
    visibleImageCount = 0; // Reiniciar el contador de imágenes visibles
    dataFilterValue = [];
    
    searchStatus.textContent = 'Loading...';

    // Hacer una solicitud a la API sin mostrar resultados
    query = searchInput.value.trim();

    if (query !== '') {
        const searchURL = `${SEARCH_BASE_URL}?q=${query}`;

        try {
            const response = await fetch(searchURL);
            if (!response.ok) {
                throw new Error('Unable to obtain a valid response from the API');
            }
            const searchData = await response.json();
            data = searchData.objectIDs; // Almacena los resultados en 'data'
        } catch (error) {
            console.error('Error when making the API request.', error);
        }
    } else {
        console.log('The search field is empty');
    }

    // Filtrar los filtros seleccionados en rojo
    const redFilters = [];
    filterItems.forEach(item => {
        const filterItem = item.querySelector('.department-link');
        const checkboxDiv = item.querySelector('.checkbox');
        if (window.getComputedStyle(checkboxDiv).backgroundColor === 'rgb(193, 42, 22)') {
            redFilters.push(filterItem.getAttribute('data-filter'));
        }
    });
    
    dataFilterValue = redFilters;
    console.log('dataFilterValue:', dataFilterValue);

    // Si no hay filtros rojos, mostrar resultados sin aplicar ningún filtro adicional
    if (dataFilterValue.length === 0) {
        displayResults(data);
    } else {
        filterByDepartment();
    }
}




async function getObjectDataById(objectId) {
    const objectURL = `${OBJECT_BASE_URL}/${objectId}`;
    try {
        const response = await fetch(objectURL);
        if (!response.ok) {
            throw new Error('Unable to obtain object details from the API');
        }
        const objectData = await response.json();
        return objectData;
    } catch (error) {
        console.error('Error when fetching object details.', error);
        return null;
    }
}


async function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    const searchStatus = document.querySelector('.search-status');
    searchStatus.textContent = 'Loading...';

    // Limpia el contenido anterior en el contenedor de resultados
    resultsContainer.innerHTML = '';

    // Elimina duplicados de la lista de datos
    const uniqueObjectIDs = new Set(data);
    data = Array.from(uniqueObjectIDs);

    // Inicializa el contador de imágenes visibles
    let visibleImageCount = 0;

    // Construye el mensaje inicial con el término de búsqueda
    let message = `Results for "<strong>${query}</strong>"`;

    // Agregar los filtros seleccionados al mensaje con "and"
    if (selectedFilters.length > 0) {
        message += ' and "<strong>' + selectedFilters.join('</strong>" and "<strong>') + '</strong>"';
    }
    


    // Crea un array de promesas para las llamadas a getObjectDataById
    const objectDataPromises = data.map(async (objectId) => {
        const objectData = await getObjectDataById(objectId);
        if (objectData) {
            // Comprueba si el objeto tiene una imagen válida
            if (objectData.primaryImage && objectData.primaryImage.indexOf('http') === 0) {
                // Crea un elemento de objeto y agrega el objeto al contenedor de resultados
                const objectElement = createObjectElement(objectData);
                resultsContainer.appendChild(objectElement);
                visibleImageCount++; // Incrementa el contador de imágenes visibles
            }
        }
    });

    // Espera a que todas las llamadas a getObjectDataById se completen
    await Promise.all(objectDataPromises);

    // Actualiza el contenido del elemento search-status con el mensaje construido
    searchStatus.innerHTML = `${message}: Total visible images ${visibleImageCount} / of ${data.length} results.`;

    getTotalResultsForFilter(dataFilterValue);
    updateTotalResultsForFilters();
}

//------------------------------
//Elementos creados


// Función para crear elementos de objeto
function createObjectElement(objectData) {
    const objectContainer = document.createElement('div');
    const objectLink = document.createElement('a');
    const objectImage = document.createElement('img');
    const imageInfo = document.createElement('div');
    const title = document.createElement('h3');
    const artist = document.createElement('p');
    const date = document.createElement('p');

    if (selectedView === 'columns') {
        objectContainer.classList.add('object');
        imageInfo.classList.add('image-info');
        objectImage.classList.add('image-fade-in');
    } else if (selectedView === 'row') {
        objectContainer.classList.add('objectRow');
        imageInfo.classList.add('image-infoRow');
        objectImage.classList.add('image-fade-inRow');
    }

    objectLink.href = `./objectdetails/object-details.html?id=${objectData.objectID}`;
    objectImage.alt = 'Image';
    objectImage.style.transform = 'translateY(200px)';
    objectImage.style.transition = 'opacity 1s, transform 2s';
    objectContainer.style.transform = 'translateY(200px)';
    objectContainer.style.transition = 'opacity 1s, transform 2s, border-color 0.05s, border-width 0.05s';
    objectImage.src = objectData.primaryImage;
    objectLink.appendChild(objectImage);

    title.classList.add('title');
    title.textContent = objectData.title;
    artist.classList.add('artist');
    artist.textContent = `Artist: ${objectData.artistAlphaSort ? objectData.artistAlphaSort : 'Anonimus'}`;
    date.classList.add('date');
    date.textContent = `Date: ${objectData.objectDate || objectData.period || "Undefined"}`;

    // Limita el número de caracteres en el título
    const maxLength = 70; // Establece el número máximo de caracteres
    if (title.textContent.length > maxLength) {
        title.title = title.textContent; // Establece el atributo title con el texto completo
        title.textContent = title.textContent.substring(0, maxLength) + '...'; // Trunca el texto
    }

    // Agrega un elemento span para la estrella
    const starClasses = ["fa-solid", "fa-star"];
    const favoriteStar = document.createElement('span');
    starClasses.forEach(className => {
        favoriteStar.classList.add(className);
    });

    // Agrega un manejador de eventos para marcar/desmarcar como favorito cuando se hace clic en la estrella
    favoriteStar.addEventListener('click', () => {
        if (favoriteStar.classList.contains('favorite')) {
            // Desmarcar como favorito
            favoriteStar.classList.remove('favorite');
            // Eliminar el ID del objeto de la variable global de favoritos
            removeFromFavorites(objectData.objectID);
        } else {
            // Marcar como favorito
            favoriteStar.classList.add('favorite');
            // Almacenar el ID del objeto en la variable global de favoritos
            addToFavorites(objectData.objectID);
        }
    });

    // Añade la estrella al contenedor del objeto
    objectContainer.appendChild(favoriteStar);

    imageInfo.appendChild(title);
    imageInfo.appendChild(artist);
    imageInfo.appendChild(date);

    objectContainer.appendChild(objectLink);
    objectContainer.appendChild(imageInfo);

    setTimeout(() => {
        objectImage.classList.add('visible');
        objectImage.style.transform = 'translateY(0)';
        objectContainer.style.transform = 'translateY(0)';
    }, 50);

    if (selectedOption === 'dateDesc' || selectedOption === 'dateAsc' || selectedOption === 'alphabet') {
        reorderResults(selectedOption);
    }

    // Marca la estrella como favorita si el objeto está en la lista de favoritos
    if (favoriteObjects.includes(objectData.objectID)) {
        favoriteStar.classList.add('favorite');
    }

    return objectContainer;
}





//Sort----------------------------------
let selectedOption = [];

// Agrega un event listener al elemento select
const orderSelect = document.getElementById('order-select');
orderSelect.addEventListener('change', () => {
    selectedOption = orderSelect.value;
    reorderResults(selectedOption);
});

function reorderResults(selectedOption) {
    const resultsContainer = document.getElementById('results');
    const objectElements = resultsContainer.querySelectorAll('.object, .objectRow');

    const sortedElements = Array.from(objectElements);


    if (selectedOption === 'original') {
        createObjectElement(originalOrder);
        console.log("It is still not working");
    } else {
        sortedElements.sort((a, b) => {
            if (selectedOption === 'dateDesc') {
                // Ordena por fecha descendente
                const dateA = a.querySelector('.date').textContent;
                const dateB = b.querySelector('.date').textContent;
                return compareDatesDesc(dateA, dateB);
            } else if (selectedOption === 'dateAsc') {
                // Ordena por fecha ascendente
                const dateA = a.querySelector('.date').textContent;
                const dateB = b.querySelector('.date').textContent;
                return compareDatesAsc(dateA, dateB);
            } else if (selectedOption === 'alphabet') {
                // Ordena por título (A-Z) con comillas o corchetes omitidos
                const titleA = a.querySelector('h3').textContent;
                const titleB = b.querySelector('h3').textContent;
                const titleAWithoutSymbols = titleA.replace(/^[“"\[\]]+/g, ''); // Omitir comillas, comillas de estilo tipográfico y corchetes al principio
                const titleBWithoutSymbols = titleB.replace(/^[“"\[\]]+/g, ''); // Omitir comillas, comillas de estilo tipográfico y corchetes al principio
                const firstLetterA = titleAWithoutSymbols[0].toLowerCase();
                const firstLetterB = titleBWithoutSymbols[0].toLowerCase();
                return firstLetterA.localeCompare(firstLetterB);
            }
            // Por defecto, mantiene el orden original (Relevance)
            return 0;
        });

        // Mueve elementos sin fecha o con fechas no válidas al final
        sortedElements.sort((a, b) => {
            const dateA = a.querySelector('.date').textContent;
            const dateB = b.querySelector('.date').textContent;
            const yearRegex = /\d{4}/; // Expresión regular para encontrar 4 cifras numéricas
            const matchA = dateA.match(yearRegex);
            const matchB = dateB.match(yearRegex);
            if (!matchA) return 1;
            if (!matchB) return -1;
            return 0;
        });
    }

    // Elimina los elementos ordenados del contenedor
    objectElements.forEach(element => {
        element.remove();
    });

    // Agrega los elementos ordenados nuevamente al contenedor
    sortedElements.forEach(element => {
        resultsContainer.appendChild(element);
    });
}

function compareDatesDesc(dateA, dateB) {
    // Función para comparar fechas descendentes
    const yearRegex = /\d{4}/; // Expresión regular para encontrar 4 cifras numéricas
    const matchA = dateA.match(yearRegex);
    const matchB = dateB.match(yearRegex);

    if (matchA && matchB) {
        const yearA = parseInt(matchA[0]);
        const yearB = parseInt(matchB[0]);
        return yearB - yearA;
    }

    return 0;
}

function compareDatesAsc(dateA, dateB) {
    // Función para comparar fechas ascendentes
    const yearRegex = /\d{4}/; // Expresión regular para encontrar 4 cifras numéricas
    const matchA = dateA.match(yearRegex);
    const matchB = dateB.match(yearRegex);

    if (matchA && matchB) {
        const yearA = parseInt(matchA[0]);
        const yearB = parseInt(matchB[0]);
        return yearA - yearB;
    }

    return 0;
}


//Display view-------------------------

const viewSelect = document.getElementById('view-select');
let selectedView = 'columns'; // Establece el valor predeterminado en 'columns'

function changeObjectClass() {
    const objectElements = document.querySelectorAll('.object');
    const objectRowElements = document.querySelectorAll('.objectRow');
    const imageInfoRowElements = document.querySelectorAll('.image-infoRow');
    const imageFadeInRowElements = document.querySelectorAll('.image-fade-inRow');
    const imageFadeInRowVisibleElements = document.querySelectorAll('.image-fade-inRow.visible');

    if (selectedView === 'columns') {
        objectRowElements.forEach(element => {
            element.classList.remove('objectRow');
            element.classList.add('object');
        });
        imageInfoRowElements.forEach(element => {
            element.classList.remove('image-infoRow');
            element.classList.add('image-info');
        });
        imageFadeInRowElements.forEach(element => {
            element.classList.remove('image-fade-inRow');
            element.classList.add('image-fade-in');
        });
        imageFadeInRowVisibleElements.forEach(element => {
            element.classList.remove('image-fade-inRow');
            element.classList.add('image-fade-in');
            element.classList.add('visible');
        });
    } else if (selectedView === 'row') {
        objectElements.forEach(element => {
            element.classList.remove('object');
            element.classList.add('objectRow');
        });
    
        const imageInfoElements = document.querySelectorAll('.image-info');
        const imageFadeInElements = document.querySelectorAll('.image-fade-in');
        const visibleImageFadeInElements = document.querySelectorAll('.image-fade-in.visible');

        imageInfoElements.forEach(element => {
            element.classList.remove('image-info');
            element.classList.add('image-infoRow');
        });
    
        imageFadeInElements.forEach(element => {
            element.classList.remove('image-fade-in');
            element.classList.add('image-fade-inRow');
        });
    
        visibleImageFadeInElements.forEach(element => {
            element.classList.remove('image-fade-in');
            element.classList.add('image-fade-inRow');
            element.classList.add('visible');
        });
    }
}

viewSelect.addEventListener('change', () => {
    if (viewSelect.value === 'row') {
        selectedView = 'row';
        changeObjectClass();
        const resultsCont = document.getElementById('results');
        resultsCont.style['column-count'] = 1;
    } else {
        selectedView = 'columns';
        changeObjectClass();
        const resultsCont = document.getElementById('results');
        resultsCont.style['column-count'] = null;
    }
});

//--------------------------------------------
//Filter
// Obtener lista de los id de todos los objetos con el filtro
// Comparar los id de ambas listas para filtrar contenido igual.
// Mostrar resultados por pantalla. Modificar el mensaje por pantalla.
// Modificar el XX results. 


// Obtén una lista de todos los elementos <li> dentro de filters-container
const filterItems = document.querySelectorAll('#filters-container li');
let dataFilterValue;

filterItems.forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        const checkboxDiv = item.querySelector('.checkbox');
        dataFilterValue = item.querySelector('.department-link').getAttribute('data-filter');
        searchStatus.textContent = 'Loading...';

        // Verifica si el fondo del checkbox está rojo
        const isRed = checkboxDiv.style.backgroundColor === 'rgb(193, 42, 22)';

        if (isRed) {
            checkboxDiv.style.backgroundColor = ''; //Cambio de color del checkbox a ' ' (sin color)
            performSearch2(); //Búsqueda de resultados del query introducido
        } else {
            // Cambia el color de fondo del checkbox a rojo
            checkboxDiv.style.backgroundColor = 'rgb(193, 42, 22)';
            filterByDepartment(); // Llama a filterByDepartment solo si el fondo no es rojo
        }
    });
});


async function filterByDepartment() {
    const filterURL = `${SEARCH_BASE_URL}?q=${dataFilterValue}`;

    try {
        const response = await fetch(filterURL);
        if (!response.ok) {
            throw new Error('Unable to obtain a valid response from the API');
        }
        const filteredData = await response.json();
        const filteredObjectIDs = filteredData.objectIDs;

        // Filtra el array data para mantener solo los IDs que coinciden con los filtrados
        data = data.filter(id => filteredObjectIDs.includes(id));

        // Agregar el filtro actual a la lista de filtros seleccionados si no está presente
        if (!selectedFilters.includes(dataFilterValue)) {
            selectedFilters.push(dataFilterValue);
        }

        // Ahora data contiene solo los IDs coincidentes
        console.log('Updated data array:', data);

        // Llama a displayResults para mostrar los resultados con el mensaje actualizado
        displayResults(data);

    } catch (error) {
        console.error('Error when making the API request for filtering by department.', error);
    }
}

//ResultsCount--------------
// Función para obtener el número total de resultados para cada filtro
async function getTotalResultsForFilter(dataFilterValue) {
    // Verificar si el valor ya está en la caché
    if (filterResultsCache[dataFilterValue] !== undefined) {
        return filterResultsCache[dataFilterValue];
    }

    const filterURL = `${SEARCH_BASE_URL}?q=${dataFilterValue}`;
    const filteredObjectIDs = [];

    try {
        const response = await fetch(filterURL);
        if (!response.ok) {
            throw new Error('Unable to obtain a valid response from the API');
        }
        const filteredData = await response.json();

        // Obtener la lista de IDs y agregarlos al array filteredObjectIDs
        filteredObjectIDs.push(...filteredData.objectIDs);

        // Almacenar el resultado en caché para futuras referencias
        filterResultsCache[dataFilterValue] = [...new Set(filteredObjectIDs)];

        return filterResultsCache[dataFilterValue]; // Utilizar el valor almacenado en caché
    } catch (error) {
        console.error('Error when making the API request for total results by filter.', error);
        return []; // En caso de error, retornar un array vacío
    }
}


// Modificar la función updateTotalResultsForFilters para contar las coincidencias
async function updateTotalResultsForFilters() {
    const filterResultsSpans = document.querySelectorAll('.filter-results');
    
    for (let i = 0; i < filterItems.length; i++) {
        const item = filterItems[i];
        const dataFilterValue = item.querySelector('.department-link').getAttribute('data-filter');
        const filterResultsSpan = filterResultsSpans[i];
        
        // Obtener los IDs únicos de los resultados del filtro
        const filterObjectIDs = await getTotalResultsForFilter(dataFilterValue);
        
        // Calcular el número de objetos ID resultantes en el filtro dentro del límite de 'data' y con una 'primaryImage'
        const matchingCount = countMatchingResultsWithPrimaryImage(data, filterObjectIDs);

        // Actualizar el texto del contador con el número de coincidencias dentro del límite con 'primaryImage'
        filterResultsSpan.textContent = `(${matchingCount})`;
    }
}

// Función para contar objetos que coinciden con 'data' y tienen una 'primaryImage'
function countMatchingResultsWithPrimaryImage(mainData, filterData) {
    return mainData.filter(id => filterData.includes(id) && getObjectDataById(id).primaryImage !== null).length;
}

// Llamar a la función para actualizar el número total de resultados al cargar la página
updateTotalResultsForFilters();

//Collappse departments
document.addEventListener("DOMContentLoaded", function () {
    const departmentList = document.getElementById("department-list");
    const viewCategories = document.querySelector(".show-allCategories");

    for (let i = 5; i < departmentList.children.length; i++) {
        departmentList.children[i].style.display = "none";
    }

    viewCategories.addEventListener("click", function (e) {
        e.preventDefault();
        for (let i = 5; i < departmentList.children.length; i++) {
            if (departmentList.children[i].style.display === "none") {
                departmentList.children[i].style.display = "block";
                viewCategories.textContent = "Collapse categories";
            } else {
                departmentList.children[i].style.display = "none";
                viewCategories.textContent = "View all categories";
            }
        }
    });
});

//---------------------------
//Pagination
//---------------------------
//Menu
const navbar = document.getElementById('navbar');
let prevScrollPos = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollPos = window.scrollY;
    if (prevScrollPos > currentScrollPos) {
        // El usuario está haciendo scroll hacia arriba
        navbar.style.top = '0'; // Muestra el menú
    } else {
        // El usuario está haciendo scroll hacia abajo
        navbar.style.top = '-300px'; // Oculta el menú
    }
    prevScrollPos = currentScrollPos;
});

//---------------------------
//Star Favorites
// Variable global para almacenar la lista de objetos favoritos
const storedFavoriteObjects = localStorage.getItem('favoriteObjects');
let favoriteObjects = JSON.parse(storedFavoriteObjects) || [];

// Función para agregar un ID a la lista de favoritos en la variable global
function addToFavorites(objectID) {
    // Verifica si el objeto ya está en la lista de favoritos
    if (!favoriteObjects.includes(objectID)) {
        // Agrega el ID del objeto a la lista de favoritos
        favoriteObjects.push(objectID);
        console.log(`Add to favorites: ${objectID}`);
        console.log(favoriteObjects)
        localStorage.setItem('favoriteObjects', JSON.stringify(favoriteObjects));
    } else {
        console.log(`The object ${objectID} it's not in favorites.`);
    }
}

// Función para eliminar un ID de la lista de favoritos en la variable global
function removeFromFavorites(objectID) {
    // Verifica si el objeto está en la lista de favoritos
    const index = favoriteObjects.indexOf(objectID);
    if (index !== -1) {
        // Elimina el ID del objeto de la lista de favoritos
        favoriteObjects.splice(index, 1);
        console.log(`Remove from favorites: ${objectID}`);
        console.log(favoriteObjects)
        localStorage.setItem('favoriteObjects', JSON.stringify(favoriteObjects));
    } else {
        console.log(`The object ${objectID} it's not in favorites.`);
    }
}







