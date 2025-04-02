
const express = require('express');
const path = require('path'); // Import path module

const app = express();

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public'))); 

// Set default file when visiting the site (GLOBALPAY.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "GLOBALPAY.html"));
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
