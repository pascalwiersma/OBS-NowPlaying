const config = require("../config.json");
const API_URL = config.ICECAST_URL;
const API_URL_SONGINFO = config.PUBLIC_MUSIC_API_URL;

let previousData = null;
let currentArtist = null;
let currentSong = null;
let currentAlbum = null;

async function initData(socket) {
    let fulltitle = await getIcecastTitle();

    // Split title
    let title = fulltitle.split(" - ");
    let artist = title[0];
    let song = title[1] ?? "";

    // if () in song, remove it
    if (song.includes("(")) {
        song = song.split("(")[0].trim();
    }

    let album = await getAlbum(artist, song);

    socket.emit("artiest", currentArtist);
    socket.emit("nummer", currentSong);

    socket.emit("album", album);
}

function startSongUpdateLoop(socket) {
    async function updateSong() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            // Bekijk of de titel is veranderd
            if (
                data.icestats.source[9].title !==
                previousData?.icestats.source[9].title
            ) {
                // Update previousData
                previousData = data;

                let result = data.icestats.source[9];

                // Split title
                let title = result.title.split(" - ");
                let artist = title[0];
                let song = title[1] ?? "";

                try {
                    // Remove () from song with year or explicit
                    if (song.includes("(")) {
                        song = song.split("(")[0].trim();
                    }
                } catch (error) {
                    console.log("Error: " + error);
                }

                // Time
                const date = new Date();
                const time =
                    date.getHours() +
                    ":" +
                    date.getMinutes() +
                    ":" +
                    date.getSeconds();

                console.log(
                    "[" +
                        time +
                        "] Now on " +
                        config.stations_name +
                        ": " +
                        result.title
                );

                currentAlbum = await getAlbum(artist, song);
                currentArtist = artist;
                currentSong = song;

                socket.emit("artist", currentArtist);
                socket.emit("number", currentSong);
                socket.emit("album", currentAlbum);

                // Wait 4 seconds before broadcasting the now playing
                setTimeout(() => {
                    socket.emit("broadcast-nowplaying");
                }, 4000);

                // If song is undefined, set it to empty string
                if (song == undefined) {
                    song = "";
                }
            }
        } catch (error) {
            console.log(error);
        }

        // Schedule the next update after a delay of 1 second
        socket.updateTimeout = setTimeout(updateSong, 1000);
    }

    // Start the initial update immediately
    updateSong();
}

function stopSongUpdateLoop(socket) {
    // Clear the update timeout to stop further updates
    clearTimeout(socket.updateTimeout);
}

async function getIcecastTitle() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        let result = data.icestats.source[9];

        // Split title
        let title = result.title.split(" - ");
        let artist = title[0];
        let song = title[1];

        currentArtist = artist;
        currentSong = song;

        return result.title;
    } catch (error) {
        console.log(error);
    }
}

async function getAlbum(artist, song) {
    try {
        const url =
            API_URL_SONGINFO +
            "/song?title=" +
            encodeURIComponent(song) +
            "&artist=" +
            encodeURIComponent(artist);
        const response = await fetch(url);
        const data = await response.json();

        // if response is 200, set the album
        if (response.status === 200) {
            // If there is no album found, set the logo
            if (data.found == false) {
                currentAlbum = config.stations_logo;
            } else {
                // Set the album
                currentAlbum = data.result.covers.medium;
            }
        } else {
            // If there is no album found, set the logo
            currentAlbum = config.stations_logo;
        }

        return currentAlbum;
    } catch (error) {
        console.log(error);
        currentAlbum = "https://live.noordkopcentraal.nl/img/NKC-Logo.png";
    }
}

module.exports = {
    startSongUpdateLoop,
    stopSongUpdateLoop,
    initData,
};
