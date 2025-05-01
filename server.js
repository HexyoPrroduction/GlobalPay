// Import necessary modules
const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;

const app = express();
const server = http.createServer(app);

// --- Serve static files FROM the 'public' directory ---  *** UPDATED ***
app.use(express.static(path.join(__dirname, 'public'))); // <-- Point to 'public' folder

// --- Define route for the root URL ('/') ---             *** UPDATED ***
// Now it serves GLOBALPAY.html FROM the 'public' directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'GLOBALPAY.html')); // <-- Added 'public' to the path
});

// --- Set up WebSocket Server ---
// (This part remains the same - attached to the HTTP server)
const wss = new WebSocket.Server({ server });

// --- WebSocket logic (Keep as is) ---
let currentData = {
    amount: "50,000", // Ensure these match initial values in public/GLOBALPAY.html
    name: "Hexyo Xmax"
};
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('Client connected via WebSocket');
    clients.add(ws);

    // Send initial state
    try {
        ws.send(JSON.stringify({ type: 'initial_state', payload: currentData }));
        console.log('Sent initial state to new WebSocket client.');
    } catch (error) {
        console.error('Failed to send initial state via WebSocket:', error);
    }

    // Handle messages
    ws.on('message', (message) => {
        console.log('WebSocket received message:', message.toString());
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.type === 'update' && parsedMessage.payload) {
                const { field, value } = parsedMessage.payload;
                if (currentData.hasOwnProperty(field)) { // Basic check
                    currentData[field] = value;
                    console.log(`Updated server state: ${field} = ${value}`);
                    broadcast({
                        type: 'update',
                        payload: { field, value }
                    });
                } else {
                    console.warn(`Received update for unknown field: ${field}`);
                }
            } else {
                console.log(`Received non-update message type: ${parsedMessage.type || 'unknown'}`);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message or process update:', error);
        }
    });

    // Handle close
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
    });

    // Handle error
    ws.on('error', (error) => {
        console.error('WebSocket error on client:', error);
        clients.delete(ws);
    });
});

// Broadcast function (Keep as is)
function broadcast(message) {
    const messageString = JSON.stringify(message);
    console.log(`Broadcasting WebSocket message: ${messageString}`);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageString, (err) => {
                if (err) {
                    console.error(`Failed to send WebSocket message to a client:`, err);
                }
            });
        }
    });
}

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
    console.log(`Serving static files from the 'public' directory.`); // Updated log message
    console.log(`WebSocket server is also attached.`);
});

server.on('error', (error) => {
    console.error('HTTP Server Error:', error);
});