const express = require("express");
const path = require("path");

const app = express();
const port = 8000;

// Stel de statische bestanden in
app.use(express.static(path.join(__dirname, "public")));

// Stuur de index.html naar de root van de server
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start de server
app.listen(port, () => {
    console.log(`Frontend-server gestart op poort ${port}`);
});
