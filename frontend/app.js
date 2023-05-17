const socket = io("http://localhost:3000");
const albumContainer = document.getElementById("cardContainer");
const nowplaying = document.getElementById("nowplaying");
const album = document.getElementById("albumart");
let artist = "";
let number = "";

socket.on("artist", (data) => {
    artist = data;
});

socket.on("number", (data) => {
    number = data;
    updateNowPlaying();
});

socket.on("album", (data) => {
    album.src = data;
});

function updateNowPlaying() {
    if (number == null) {
        nowplaying.innerHTML = artist;
    } else {
        nowplaying.innerHTML = artist + " - " + number;
    }
}

socket.on("broadcast-nowplaying", () => {
    albumContainer.classList.remove("hide");
    albumContainer.style.transform = "translateX(0)";

    setTimeout(function () {
        albumContainer.style.transform = "translateX(-200%)";
        setTimeout(function () {
            albumContainer.classList.add("hide");
        }, 100);
    }, 15000);
});
