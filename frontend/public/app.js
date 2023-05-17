const socket = io("http://localhost:3000");
const albumContainer = document.getElementById("cardContainer");
const nowplaying = document.getElementById("nowplaying");
const album = document.getElementById("albumart");
let artiest = "";
let nummer = "";

// Ontvang Now Playing-gegevens van artiest en nummer
socket.on("artiest", (data) => {
    artiest = data;
});

socket.on("nummer", (data) => {
    nummer = data;
    updateNowPlaying();
});

socket.on("album", (data) => {
    album.src = data;
});

function updateNowPlaying() {
    if (nummer == null) {
        nowplaying.innerHTML = artiest;
    } else {
        nowplaying.innerHTML = artiest + " - " + nummer;
    }
}

// Ontvang een bericht van de server om de albumanimatie te starten
socket.on("broadcast-nowplaying", () => {
    // Verwijder de klasse 'hide' om de animatie te starten
    albumContainer.classList.remove("hide");
    albumContainer.style.transform = "translateX(0)";

    // Start een timer om het album na 3 seconden te verbergen
    setTimeout(function () {
        albumContainer.style.transform = "translateX(-200%)";
        setTimeout(function () {
            albumContainer.classList.add("hide");
        }, 100); // Voeg een kleine vertraging toe voor de overgang
    }, 15000);
});
