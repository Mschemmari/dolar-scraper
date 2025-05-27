const mockRates = require('../mockData.json');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');


let logCount = 0;
const saveData = (rates, modified) => {
  if (Object.keys(modified).length > 0) {
    fs.writeFileSync(path.resolve(__dirname, './modified.json'), JSON.stringify(modified));
    fs.writeFileSync(path.resolve(__dirname, './previousValues.json'), JSON.stringify(rates));
    console.log('Currency rates update:', modified);
  } else {
    logCount++;
    console.log('Waiting for changes...', logCount);
  }
};

const getModifiedValues = (rates) => {
  const savedPreviousValues = fs.readFileSync(path.resolve(__dirname, './previousValues.json'), 'utf8');
  const parsedPreviousValues = JSON.parse(savedPreviousValues);
  const modifiedValues = {};
  
  for (const value of rates) {
    const previousValue = parsedPreviousValues.find(prev => prev.name === value.name);
    if (!previousValue 
      || previousValue.buyValue !== value.buyValue 
      || previousValue.sellValue !== value.sellValue) {
      modifiedValues[value.name] = {
        newValue: value,
        previousValue,
      };
    }
  }
  return Object.values(modifiedValues);
};

const fetchRates = async () => {
  try {
    const baseUrl = 'https://www.cronista.com/MercadosOnline/dolar.html';
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });
    const response = await axios.get(baseUrl, { httpsAgent: agent })
    const $ = cheerio.load(response.data);

    const row1 = $('#market-scrll-2').find('tr').toArray();
    const row2 = $('#market-scrll-3').find('tr').toArray();
    const data = [...row1, ...row2];

    rates = data.map((val) => {
      const name = $(val).find('.name a').text().replace(/�/g, 'ó');
      const buyValue = $(val).find('.buy-wrapper .buy-value').text().replace(/\$/g, '');
      const sellValue = $(val).find('.sell-wrapper .sell-value').text().replace(/\$/g, '');
      const variation = $(val).find('.percentage').text().replace(/\%/g, '');
      return { name, buyValue, sellValue, variation };
    });
    
    const filteredRates = rates.filter((val) => val.buyValue !== '');
    const modified = getModifiedValues(rates);
    saveData(rates, modified);
    return { rates, modified };
  } catch (error) {
    console.error('Error scraping data:', error);
    return [];
  }
};

module.exports = {
  fetchRates,
};
