// object-details.js
const OBJECT_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

const urlParams = new URLSearchParams(window.location.search);
const objectId = urlParams.get('id');
const searchInput = document.querySelector('.input-search'); // Selector para el campo de entrada de búsqueda

// Redirige al usuario al índice (index.html) con el nuevo valor de búsqueda en la URL
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query === '') {
            return;
        }
        window.location.href = `../index.html?q=${query}`;
    }
});

async function fetchObjectDetails(objectId) {
    try {
        const objectResponse = await fetch(`${OBJECT_BASE_URL}/${objectId}`);
        const object = await objectResponse.json();
        displaySelectedObject(object);
    } catch (error) {
        console.log('Error:', error);
        displaySelectedObject({ primaryImage: '../images/nodataimage.jpg', title: 'Object Not Found' });
    }
}

function displaySelectedObject(object) {
    const objectDetailsContainer = document.getElementById('object-details-container');
    objectDetailsContainer.innerHTML = '';

    const imageContainer = document.createElement('div');
    imageContainer.classList.add('object-image-container');
    
    const selectedImage = document.createElement('img');
    selectedImage.src = object.primaryImage;
    selectedImage.alt = object.title;
    selectedImage.classList.add('object-image');
    imageContainer.appendChild(selectedImage);

    const detailsList = document.createElement('div');
    detailsList.classList.add('object-details-list');

    const selectedTitle = document.createElement('h3');
    selectedTitle.textContent = object.title;
    selectedTitle.classList.add('object-title');
    detailsList.appendChild(selectedTitle);

    const detailsToDisplay = [
    
    { key: 'artistAlphaSort', label: 'Artist' },
    { key: 'artistNationality', label: 'Artist Nationality' },
    { key: 'objectBeginDate', label: 'Creation Date' },
    { key: 'medium', label: 'Medium' },
    { key: 'dimensions', label: 'Dimensions' },
    { key: 'dimensionsParsed', label: 'Parsed Dimensions' },
    { key: 'department', label: 'Department' },
    { key: 'geographyType', label: 'Geography Type' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'county', label: 'County' },
    { key: 'country', label: 'Country' },
    { key: 'region', label: 'Region' },
    { key: 'subregion', label: 'Subregion' },
    { key: 'locale', label: 'Locale' },
    { key: 'locus', label: 'Locus' },
    { key: 'excavation', label: 'Excavation' },
    { key: 'river', label: 'River' },
    { key: 'classification', label: 'Classification' },
    { key: 'linkResource', label: 'Link Resource' },
    { key: 'repository', label: 'Repository' },
    { key: 'objectURL', label: "Click here for more information on The Met's website"},
    { key: 'objectWikidata_URL', label: 'Click here to access Object Wikidata' },
];

    detailsToDisplay.forEach(detail => {
        if (object[detail.key]) {
            const detailElement = document.createElement('p');
            if (detail.key === 'objectURL'||detail.key === 'objectWikidata_URL'||detail.key ==='linkResource') {
                // Si el detalle es 'Link Resource', crea un enlace en lugar de un párrafo
                const linkElement = document.createElement('a');
                linkElement.href = object[detail.key];
                linkElement.textContent = detail.label;
                detailElement.appendChild(linkElement);
            } else {
                // Para otros detalles, crea un párrafo normal
                detailElement.textContent = `${detail.label}: ${object[detail.key]}`;
            }
            detailElement.classList.add(`object-${detail.key}`);
            detailsList.appendChild(detailElement);
        }
    });

    objectDetailsContainer.appendChild(imageContainer);
    objectDetailsContainer.appendChild(detailsList);
}

window.addEventListener('DOMContentLoaded', () => {
    fetchObjectDetails(objectId);
});
//----------------------------
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