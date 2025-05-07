const express = require('express');
const http = require('http');  // Required for integrating with Socket.IO
const { Server } = require('socket.io');
const {fetchRates} = require('./utils');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);

const emitUpdates = (rates, modified) => {
   if(modified.length > 0){
    io.emit('data-update', rates, modified);
    console.log('🔁 Emitted updated rates to all clients');
   }
 };

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  const getRates = setInterval(async () => {
    const { rates, modified } = await fetchRates();
    emitUpdates(rates,  modified );
  }, 9000);

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    clearInterval(getRates);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
