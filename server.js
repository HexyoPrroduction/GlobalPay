const express = require('express');
const path = require('path'); // Import path module
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Serve files from the 'public' folder

// Set the default route to serve GLOBALPAY.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "GLOBALPAY.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;  // Use environment-defined port or default to 3000
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
