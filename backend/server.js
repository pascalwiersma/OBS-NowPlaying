const config = require("./config.json");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);

const {
    startSongUpdateLoop,
    stopSongUpdateLoop,
    initData,
} = require("./functions/songUpdate");

//  Configureer de socket.io server
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    io.emit("broadcast-nowplaying");

    initData(socket);

    // Start de song update loop voor deze socket
    startSongUpdateLoop(socket);

    // Als de socket disconnect, stop dan de song update loop
    socket.on("disconnect", () => {
        stopSongUpdateLoop(socket);
    });
});

server.listen(config.port, () =>
    console.log(`
   ----------------------------------------------
   |   Noordkop Centraal NowPlaying (Backend)   |
   |                                            |
   |               © 2023 - v1.0.0              |
   |        Dit systeem is mede mogelijk        |
   |        gemaakt door Pascal Services        |
   |         https://pascalservices.nl          |
   ----------------------------------------------
`)
);
