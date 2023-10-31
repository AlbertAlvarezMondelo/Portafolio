const SEARCH_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/search';
const OBJECT_BASE_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';

const storedFavoriteObjects = localStorage.getItem('favoriteObjects');
const favoriteObjects = JSON.parse(storedFavoriteObjects) || [];
console.log(favoriteObjects);


function createFavObject(objectID) {
    const objectContainer = document.createElement('div');
    const objectLink = document.createElement('a');
    const objectImage = document.createElement('img');
    const imageInfo = document.createElement('div');
    const title = document.createElement('h3');
    const artist = document.createElement('p');
    const date = document.createElement('p');

    objectContainer.classList.add('object');
    imageInfo.classList.add('image-info');
    objectImage.classList.add('image-fade-in');

    // Realiza una solicitud a la API para obtener los datos usando objectID
    fetch(`${OBJECT_BASE_URL}/${objectID}`)
        .then(response => response.json())
        .then(data => {
            // Configura el contenido del objeto con los datos de la API
            title.textContent = data.title;
            artist.textContent = `Artist: ${data.artistAlphaSort ? data.artistAlphaSort : 'Anonimus'}`;
            date.textContent = `Date: ${data.objectDate || data.period || 'Undefined'}`;

            // Establece la URL de la imagen
            if (data.primaryImage) {
                objectImage.src = data.primaryImage;
            } else {
                // Si no hay una imagen, establece una URL de marcador de posición
                objectImage.src = 'URL_DE_IMAGEN_DE_MARCADOR_DE_POSICIÓN';
            }

            // Agrega el objeto al contenedor de favoritos
            objectLink.href = `../objectdetails/object-details.html?id=${objectID}`;
            objectLink.appendChild(objectImage);
            imageInfo.appendChild(title);
            imageInfo.appendChild(artist);
            imageInfo.appendChild(date);

            objectContainer.appendChild(objectLink);
            objectContainer.appendChild(imageInfo);

            // Añade un manejador de eventos para marcar/desmarcar como favorito cuando se hace clic en la estrella
            const starClasses = ["fa-solid", "fa-star"];
            const favoriteStar = document.createElement('span');
            starClasses.forEach(className => {
                favoriteStar.classList.add(className);
            });

            favoriteStar.addEventListener('click', () => {
                if (favoriteStar.classList.contains('favorite')) {
                    // Desmarcar como favorito
                    favoriteStar.classList.remove('favorite');
                    removeFromFavorites(objectID);
                    
                    // Elimina el objeto de la pantalla
                    favoritesContainer.removeChild(objectContainer);
                } else {
                    // Marcar como favorito
                    favoriteStar.classList.add('favorite');
                    addToFavorites(objectID);
                }
            });

            // Añade la estrella al contenedor del objeto
            objectContainer.appendChild(favoriteStar);

            // Marcar como favorito si el objeto está en la lista de favoritos
            if (favoriteObjects.includes(objectID)) {
                favoriteStar.classList.add('favorite');
            }

            setTimeout(() => {
                objectImage.classList.add('visible');
                objectImage.style.transform = 'translateY(0)';
                objectContainer.style.transform = 'translateY(0)';
            }, 50);
        });

    return objectContainer;
}



// Obtén el contenedor donde deseas agregar los elementos favoritos
const favoritesContainer = document.getElementById('favorites-container');

// Itera a través de los objetos en favoriteObjects y crea elementos para cada uno
favoriteObjects.forEach(objectID => {
    const favObjectElement = createFavObject(objectID);
    favoritesContainer.appendChild(favObjectElement);
});

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
