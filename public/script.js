const socket = io();
let map;
let watchId;
const markers = {};

// Initialize the map if it exists
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("map")) {
        map = L.map("map").setView([17.984125058606022, 79.53077428042863], 16);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap",
        }).addTo(map);
    }

    const startSharingButton = document.getElementById("startSharing");
    const stopSharingButton = document.getElementById("stopSharing");

    // Start location sharing
    if (startSharingButton) {
        startSharingButton.addEventListener("click", () => {
            if (navigator.geolocation) {
                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        socket.emit("send-location", { latitude, longitude, role: "driver" });
                    },
                    (error) => {
                        console.error(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 3000,
                        maximumAge: 0,
                    }
                );
                alert("Location sharing started.");
            } else {
                alert("Geolocation is not supported by your browser.");
            }
        });
    }

    // Stop location sharing
    if (stopSharingButton) {
        stopSharingButton.addEventListener("click", () => {
            if (navigator.geolocation && watchId) {
                navigator.geolocation.clearWatch(watchId); // Stop geolocation updates
                watchId = null; // Reset watchId
                alert("Location sharing stopped.");
            }
            socket.emit("stop-sharing", { role: "driver" }); // Notify others
            window.location.href = "/"; // Redirect to homepage
        });
    }
});

// Handle incoming location updates
socket.on("receive-location", (data) => {
    const { id, latitude, longitude, role } = data;
    if (map) {
        if (role === "driver") {
            if (markers[id]) {
                // Update marker's position
                markers[id].setLatLng([latitude, longitude]);
            } else {
                // Add new marker
                markers[id] = L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup("Driver");
            }
        }
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
