const config = require("../config.json");
const API_URL = config.ICECAST_URL;
const API_URL_SONGINFO = config.MUZIEKINFO_URL;

let previousData = null; // Track previous data

function startSongUpdateLoop(socket) {
    // Define an asynchronous function to periodically update the song
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

                // get time and date
                let date = new Date();
                let time = date.getHours() + ":" + date.getMinutes();

                console.log(
                    "[" + time + "] Nu op de radio: " + artist + " - " + song
                );

                // try {
                //     // Remove () from song with year or explicit
                //     if (song.includes("(")) {
                //         song = song.split("(")[0].trim();
                //     }
                // } catch (error) {}

                getSongInfo(socket, song, artist);

                socket.emit("artiest", artist);
                socket.emit("nummer", song);

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

async function getSongInfo(socket, song, artist) {
    try {
        const response = await fetch(
            API_URL_SONGINFO +
                "/song?title=" +
                encodeURIComponent(song) +
                "&artist=" +
                encodeURIComponent(artist)
        );
        const data = await response.json();

        if (data.found == false) {
            socket.emit(
                "album",
                "https://live.noordkopcentraal.nl/img/NKC-Logo.png"
            );
        } else {
            socket.emit("album", data.result.covers.medium);
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    startSongUpdateLoop,
    stopSongUpdateLoop,
    getSongInfo,
};
