const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

let drivers = {}; // Store authenticated drivers
io.on("connection", (socket) => {
    console.log("New connection:", socket.id);

    socket.on("send-location", (data) => {
        console.log(`Location received from ${socket.id}:`, data);
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("stop-sharing", (data) => {
        console.log(`Driver ${socket.id} stopped sharing location.`);
        io.emit("user-disconnected", socket.id);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", function (req, res) {
    res.render("homepage");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", express.urlencoded({ extended: true }), (req, res) => {
    const { username, password } = req.body;

    // Basic driver authentication (replace with a real database later)
    if (username === "driver" && password === "1234") {
        drivers[username] = true; // Mark driver as logged in
        res.redirect("/drivers");
    } else {
        res.send("Invalid credentials. <a href='/login'>Try again</a>");
    }
});

app.get("/drivers", function (req, res) {
    res.render("drivers");
});

app.get("/users", function (req, res) {
    res.render("users");
});

server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
