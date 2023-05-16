const socket = io("http://localhost:3000");

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
