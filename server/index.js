const express = require('express');
const http = require('http');  // Required for integrating with Socket.IO
const axios = require('axios');
const cheerio = require('cheerio');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server);

// Variable to store the scraped data
let scrapedData = {};

// Function to scrape data
const scrapeData = async () => {
  try {
    // Fetch the HTML of the page
    const { data } = await axios.get('https://dolarhoy.com/');
    
    // Load the HTML into cheerio
    const $ = cheerio.load(data);

    // Define the selectors for the data you want to scrape
    const buyPrice = $('div[data-sell]').attr('data-sell');
    const sellPrice = $('div[data-buy]').attr('data-buy');
    const officialBuy = $('div[data-official-buy]').attr('data-official-buy');
    const officialSell = $('div[data-official-sell]').attr('data-official-sell');

    // Update the scraped data
    scrapedData = {
      buyPrice,
      sellPrice,
      officialBuy,
      officialSell,
      lastUpdated: new Date().toISOString()
    };

    console.log('Data scraped and updated:', scrapedData);

    // Emit the updated data to all connected clients via WebSocket
    io.emit('data-update', scrapedData);
  } catch (error) {
    console.error('Error scraping data:', error);
  }
};

// Run the scraping function every 1 second
setInterval(scrapeData, 1000);

// Initial scrape
scrapeData();

// Endpoint to serve the latest scraped data via HTTP
app.get('/scrape', (req, res) => {
  res.json(scrapedData);
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Send the current data to the new client
  socket.emit('data-update', scrapedData);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
