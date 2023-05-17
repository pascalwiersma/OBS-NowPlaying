const config = require("../config.json");
const API_URL = config.ICECAST_URL;
const API_URL_SONGINFO = config.MUZIEKINFO_URL;

// get time and date
const date = new Date();
const time = date.getHours() + ":" + date.getMinutes();

let previousData = null;
let currentArtist = null;
let currentSong = null;
let currentAlbum = null;

async function initData(socket) {
    let fulltitle = await getIcecastTitle();

    // Split title
    let title = fulltitle.split(" - ");
    let artist = title[0];
    let song = title[1];

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

            // Compare data with previousData
            if (
                data.icestats.source[9].title !==
                previousData?.icestats.source[9].title
            ) {
                previousData = data; // Update previousData

                let result = data.icestats.source[9];

                // Split title
                let title = result.title.split(" - ");
                let artist = title[0];
                let song = title[1];

                try {
                    // Remove () from song with year or explicit
                    if (song.includes("(")) {
                        song = song.split("(")[0].trim();
                    }
                } catch (error) {
                    console.log("Error: " + error);
                }

                console.log(
                    "[" + time + "] Nu op de radio: " + artist + " - " + song
                );

                currentAlbum = await getAlbum(artist, song);
                currentArtist = artist;
                currentSong = song;

                socket.emit("artiest", currentArtist);
                socket.emit("nummer", currentSong);
                socket.emit("album", currentAlbum);

                // Als er geen artiest is, zet dan op niets
                if (song == undefined) {
                    song = "";
                } else {
                    song = artist + " - " + song;
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
            API_URL_SONGINFO + "/song?title=" + encodeURIComponent(artist) + "&artist=" + encodeURIComponent(song);
        console.log(url);
        const response = await fetch(url);
        const data = await response.json();

        if (data.found == false) {
            currentAlbum = "https://live.noordkopcentraal.nl/img/NKC-Logo.png";
            
        } else {
            currentAlbum = data.result.covers.medium;
        }

        console.log("Current album is " + currentAlbum);
        
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
