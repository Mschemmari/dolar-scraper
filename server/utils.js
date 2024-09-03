const { getDatabase, ref, set } = require('firebase/database');
const {initializeApp} = require('firebase/app');
const axios = require('axios');
const cheerio = require('cheerio');
const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: 'cotizadolarxcasa.firebaseapp.com',
  projectId: 'cotizadolarxcasa',
  storageBucket: 'cotizadolarxcasa.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};
initializeApp(firebaseConfig);
const array = 
[
  {
    buyValue: '931,00',
    name: 'Dólar BNA',
    sellValue: '972,00',
    variation: '0,21'
  },
  {
    buyValue: '1.285,00',
    name: 'Dólar Blue',
    sellValue: '1.305,00',
    variation: '-0,76'
  },
  {
    buyValue: '1.279,60',
    name: 'Dólar MEP',
    sellValue: '1.282,59',
    variation: '0,89'
  },
  {
    buyValue: '930,14',
    name: 'Dólar mayorista',
    sellValue: '970,06',
    variation: '0,21'
  },
  {
    buyValue: '1.289,47',
    name: 'Dólar CCL GD30 48 hs',
    sellValue: '1.304,40',
    variation: '1,57'
  },
  {
    buyValue: '1.490,20',
    name: 'Dólar turista',
    sellValue: '1.55,20',
    variation: '0,21'
  }
];
let prevData = []; // Global variable to store previous data

const compareData = (cotizaciones) => {
  // const modifiedCotizaciones = cotizaciones.filter((newVal, index) => {
  //   const oldVal = prevData.find(item => item.sellValue !== newVal.sellValue);
  //   if (!oldVal) return true; // New item, add to result
  //   const modifiedItem = {};
  //   Object.keys(newVal).forEach(key => {
  //     if (newVal[key] !== oldVal[key]) {
  //       modifiedItem[key] = newVal[key];
  //     }
  //   });

  //   if (Object.keys(modifiedItem).length > 0) {
  //     return true;
  //   }

  //   return false;
  // });
  // prevData = cotizaciones; // Update global variable with new data
  // console.log(modifiedCotizaciones, 'aa');
  // return modifiedCotizaciones;
};
const saveData = (cotizaciones) => {
  const db = getDatabase();
  set(ref(db, 'cotizaciones/'), {
    cotizaciones,
  });
};
const scrapeData = async () => {
  try {
    
    const baseUrl = 'https://www.cronista.com/MercadosOnline/dolar.html'
    const response = await axios.get(baseUrl)

    const $ = cheerio.load(response.data);

    const row1 = $('#market-scrll-2').find('tr').toArray();
    const row2 = $('#market-scrll-3').find('tr').toArray();
    const data = [...row1, ...row2];

    const cotizaciones = data.map((val) => {
    const name = $(val).find('.name a').text().replace(/�/g, 'ó');
    const buyValue = $(val).find('.buy-wrapper .buy-value').text().replace(/\$/g, '');
    const sellValue = $(val).find('.sell-wrapper .sell-value').text().replace(/\$/g, '');
    // const precioAnterior = $(val).find('.previousvalue .val').text().replace(/\$/g, '');
    const variation = $(val).find('.percentage').text().replace(/\%/g, '');
      return values = {
        buyValue,
        name,
        sellValue,
        variation,
      };
    })
    compareData(array);
    // saveData(cotizaciones);
  }  catch (error) {
    console.error('Error scraping data:', error);
  }
};
module.exports = {
  firebaseConfig,
  saveData,
  scrapeData,
}