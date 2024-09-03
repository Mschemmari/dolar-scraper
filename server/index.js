const express = require('express');
const http = require('http');  // Required for integrating with Socket.IO
const { Server } = require('socket.io');
const e = require('express');
const {scrapeData} = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server);
setInterval(scrapeData, 9000);
// Initial scrape
scrapeData();
// Endpoint to serve the latest scraped data via HTTP
app.get('/scrape', (req, res) => {
  console.log(req);
  console.log('aaaa');
  res.json(formatData(...data1, ...data2));
  
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Send the current data to the new client
  socket.emit('data-update', );

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
