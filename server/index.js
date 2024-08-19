const express = require('express');
const http = require('http');  // Required for integrating with Socket.IO
const axios = require('axios');
const cheerio = require('cheerio');
const { Server } = require('socket.io');
const e = require('express');
const { log } = require('console');

const app = express();
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server);

// Variable to store the scraped data
let scrapedDataContainer = (newData)=>{
  let dataArray = [];
  let dataSet = new Set();
  dataArray.push(newData);  // Add to the array
  dataSet.add(newData);  // Track in the Set
  return dataSet
}

// Function to scrape data
const scrapeData = async () => {
  
  try {
    const currencyCode = {
      ARSB: 'Dólar Blue',
      ARSCONT: 'Dólar Contado con Liquidación',
      ARSTAR: 'Dólar Tarjeta',
      ARSMEP: 'Dólar MEP'
    }
    const currencies = Array.from(Object.keys(currencyCode))
    const baseUrl = 'https://www.cronista.com/MercadosOnline/dolar.html'
    const response = await axios.get(baseUrl)
        
        
    const $ = cheerio.load(response.data);
    const row1 = $('#market-scrll-2').find('tr').toArray();
    const row2 = $('#market-scrll-3').find('tr').toArray();
      const data1 = row1.map((val) => {
      const name = $(val).find('.name a').text()
      const precioCompra = $(val).find('.buy-wrapper .buy-value').text().replace(/\$/g, '');
      const precioVenta = $(val).find('.sell-wrapper .sell-value').text().replace(/\$/g, '');
      // const precioAnterior = $(val).find('.previousvalue .val').text().replace(/\$/g, '');
      const variacion = $(val).find('.percentage').text().replace(/\%/g, '');
      return values = {
        name,
        precioCompra,
        precioVenta,
        // precioAnterior,
        variacion,
        actualizado: new Date().toISOString()
      };
    })
    const data2 = row2.map((val) => {
      const name = $(val).find('.name a').text()//.replace(/\$/g, '');
      const precioCompra = $(val).find('.buy-wrapper .buy-value').text().replace(/\$/g, '');
      const precioVenta = $(val).find('.sell-wrapper .sell-value').text().replace(/\$/g, '');
      // const precioAnterior = $(val).find('.previousvalue .val').text().replace(/\$/g, '');
      const variacion = $(val).find('.percentage').text().replace(/\%/g, '');
      return values = {
        name,
        precioCompra,
        precioVenta,
        // precioAnterior,
        variacion,
        actualizado: new Date().toISOString()
      };
    })
    // console.log(scrapedDataContainer([...data1, ...data2]));
    // Emit the updated data to all connected clients via WebSocket
    io.emit('data-update', scrapedDataContainer(...data1, ...data2));
  }  catch (error) {
    console.error('Error scraping data:', error);
  }
};

// Run the scraping function every 1 second
setInterval(scrapeData, 20000);

// Initial scrape
scrapeData();

// Endpoint to serve the latest scraped data via HTTP
app.get('/scrape', (req, res) => {
  console.log(req);
  console.log('aaaa');
  res.json(scrapedDataContainer(...data1, ...data2));
  
});

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  // Send the current data to the new client
  socket.emit('data-update', scrapedDataContainer(...data1, ...data2));

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A client disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
