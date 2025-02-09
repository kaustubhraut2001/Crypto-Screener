/*
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { USDMClient } = require('binance');
const { WebsocketClient } = require('binance');
require('dotenv').config();

const app = express();
const axios = require('axios');

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app's URL
    methods: ["GET", "POST", "DELETE", "UPDATE"],
  },
});

const API_KEY = 'vtT0hf4A3uI1VFp3nvaUyq0dXxMQaqZiy1qGNdBZXQTjAfQVoIJ1qel5OCyIng';
const API_SECRET = '97NMrpVpGrPZZtAy1x9rzTIH2i17buH8USFCm7WTq8YpcPApb32Gh4cPYE7EDh';

const wsClient = new WebsocketClient({
  api_key: API_KEY,
  api_secret: API_SECRET,
  beautify: true,
});

// In-memory store for Kline volumes
const volumeStore = {
  "1m": {},
  "5m": {},
  "15m": {},
  "1h": {},
};

// Function to save only the Kline volume when the candlestick closes
function saveKlineVolume(symbol, timeframe, kline) {
  if (!kline.final) return; // Save only closed candles (final: true)

  if (!volumeStore[timeframe][symbol]) {
    volumeStore[timeframe][symbol] = [];
  }

  // Save only the volume
  volumeStore[timeframe][symbol].push({
    closeTime: kline.endTime,
    volume: kline.volume,
  });

  // Ensure that no more than 20 volumes are stored
  if (volumeStore[timeframe][symbol].length > 20) {
    volumeStore[timeframe][symbol].shift(); // Remove the oldest volume
  }

  // Calculate relative volume
  calculateRelativeVolume(symbol, timeframe);
}

// Function to calculate relative volume based on the last 20 volumes
function calculateRelativeVolume(symbol, timeframe) {
  const volumes = volumeStore[timeframe][symbol];
  if (volumes.length < 2) return; // Cannot calculate relative volume with less than 2 volumes

  const latestVolume = volumes[volumes.length - 1].volume;
  const averageVolume = volumes.reduce((acc, data) => acc + parseFloat(data.volume), 0) / volumes.length;

  const relativeVolume = latestVolume / averageVolume;

  // Emit data to frontend via Socket.IO
  io.emit('volumeData', {
    symbol,
    timeframe,
    latestVolume,
    relativeVolume,
  });

  // Check if the relative volume is 5 times higher
 // if (relativeVolume >= 5) {
   // console.log(`High Volume Detected for ${symbol} (${timeframe})`);
  //} else {
    //console.log(`Normal Trading Continuing for ${symbol} (${timeframe})`);
  //}


}

// Subscribe to all symbols for specified timeframes
async function subscribeAllSymbols() {
  try {
    const usdmClient = new USDMClient({
      api_key: API_KEY,
      api_secret: API_SECRET,
    });

    // Fetch all USDM symbols
    const exchangeInfo = await usdmClient.getExchangeInfo();
    const symbols = exchangeInfo.symbols.map((s) => s.symbol);

    // Define required timeframes
    const timeframes = ["1m", "5m", "15m", "1h"];

    // Subscribe to Klines for all symbols and timeframes
    symbols.forEach((symbol) => {
      timeframes.forEach((tf) => {
        wsClient.subscribeKlines(symbol, tf, "usdm");
      });
    });

    //console.log(`Subscribed to Klines for timeframes: ${timeframes.join(", ")}`);
  } catch (error) {
   // console.error("Error subscribing to symbols:", error);
  }
}

// WebSocket event handling
wsClient.on('formattedMessage', (data) => {
  if (data.eventType === "kline" && data.kline) {
    const {
      symbol,
      kline: { interval, ...kline },
    } = data;

    // Save Kline volume only when it closes
    saveKlineVolume(symbol, interval, kline);
  }
});

wsClient.on('open', (data) => {
 // console.log('WebSocket connection opened:', data.wsKey);
});

wsClient.on('error', (err) => {
 // console.error('WebSocket Error:', err);
});

// Start subscription
subscribeAllSymbols();

server.listen(3005, () => {
 // console.log('Server listening on port 3005');
});


*/





/*
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { USDMClient } = require('binance');
const { WebsocketClient } = require('binance');
require('dotenv').config();

const app = express();
const axios = require('axios');

app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React app's URL
    methods: ["GET", "POST", "DELETE", "UPDATE"],
  },
});

const API_KEY = 'vtT0hf4A3uI1VFp3nvaUyq0dXxMQaqZiy1qGNdBZXQTjAfQVoIJ1qel5OCyIng';
const API_SECRET = '97NMrpVpGrPZZtAy1x9rzTIH2i17buH8USFCm7WTq8YpcPApb32Gh4cPYE7EDh';

const wsClient = new WebsocketClient({
  api_key: API_KEY,
  api_secret: API_SECRET,
  beautify: true,
});

// In-memory store for 24-hour Kline volumes
const volumeStore24hr = {};

// Function to save the 1-minute Kline volume for the last 24 hours
function save24hrVolume(symbol, kline) {
  if (!kline.final) return; // Save only closed candles (final: true)

  if (!volumeStore24hr[symbol]) {
    volumeStore24hr[symbol] = [];
  }

  // Save only the volume for the 1-minute timeframe
  volumeStore24hr[symbol].push(parseFloat(kline.volume));

  // Ensure only 24 hours of 1-minute candles are stored
  const maxCandles = 60 * 24; // 60 minutes * 24 hours
  if (volumeStore24hr[symbol].length > maxCandles) {
    volumeStore24hr[symbol].shift(); // Remove the oldest volume
  }

  // Calculate relative volume for the last 24 hours
  calculateRelativeVolume24hr(symbol);
}

// Function to calculate relative volume based on the last 24-hour volumes
function calculateRelativeVolume24hr(symbol) {
  const volumes = volumeStore24hr[symbol];
  if (volumes.length < 2) return; // Cannot calculate relative volume with less than 2 volumes

  const latestVolume = volumes[volumes.length - 1];
  const averageVolume = volumes.reduce((acc, volume) => acc + volume, 0) / volumes.length;

  const relativeVolume = latestVolume / averageVolume;

  // Emit data to frontend via Socket.IO
  io.emit('volumeData24hr', {
    symbol,
    latestVolume,
    averageVolume,
    relativeVolume,
  });

  // Uncomment this section if you want additional logging
 // if (relativeVolume >= 5) {
   //  console.log(`High Relative Volume Detected for ${symbol} (24hr average).`);
   //} else {
     //console.log(`Normal Trading Volume for ${symbol} (24hr average).`);
   //}
}

// Subscribe to all symbols for specified timeframes
async function subscribeAllSymbols() {
  try {
    const usdmClient = new USDMClient({
      api_key: API_KEY,
      api_secret: API_SECRET,
    });

    // Fetch all USDM symbols
    const exchangeInfo = await usdmClient.getExchangeInfo();
    const symbols = exchangeInfo.symbols.map((s) => s.symbol);

    // Subscribe to Klines for all symbols (1-minute timeframe only for 24-hour tracking)
    symbols.forEach((symbol) => {
      wsClient.subscribeKlines(symbol, "1m", "usdm");
    });

  //  console.log(`Subscribed to 1m Klines for all symbols`);
  } catch (error) {
    // console.error("Error subscribing to symbols:", error);
  }
}

// WebSocket event handling
wsClient.on('formattedMessage', (data) => {
  if (data.eventType === "kline" && data.kline) {
    const {
      symbol,
      kline: { interval, ...kline },
    } = data;

    // Process only 1-minute Kline data for 24-hour tracking
    if (interval === "1m") {
      save24hrVolume(symbol, kline);
    }
  }
});

wsClient.on('open', (data) => {
  // console.log('WebSocket connection opened:', data.wsKey);
});

wsClient.on('error', (err) => {
  // console.error('WebSocket Error:', err);
});

// Start subscription
subscribeAllSymbols();

server.listen(3001, () => {
   console.log('Server listening on port 3001');
});

*/







const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { USDMClient } = require('binance');
const { WebsocketClient } = require('binance');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    //origin: "http://localhost:3000",
    origin: "http://13.202.182.86:3000",
    methods: ["GET", "POST", "DELETE", "UPDATE"],
  },
});

const API_KEY = 'vtT0hf4A3uI1VFp3nvaUyq0dXxMQaqZiy1qGNdBZXQTjAfQVoIJ1qel5OCyIng';
const API_SECRET = '97NMrpVpGrPZZtAy1x9rzTIH2i17buH8USFCm7WTq8YpcPApb32Gh4cPYE7EDh';

const wsClient = new WebsocketClient({
  api_key: API_KEY,
  api_secret: API_SECRET,
  beautify: true,
});

// In-memory store for 1m, 5m, 15m, 1h volumes
const volumeStore = {
  "1m": {},
  "5m": {},
  "15m": {},
  "1h": {},
};

// In-memory store for 24-hour volumes
const volumeStore24hr = {};

// Function to save Kline volumes for 1m, 5m, 15m, 1h
function saveKlineVolume(symbol, timeframe, kline) {
  if (!kline.final) return;

  if (!volumeStore[timeframe][symbol]) {
    volumeStore[timeframe][symbol] = [];
  }

  volumeStore[timeframe][symbol].push({
    closeTime: kline.endTime,
    volume: kline.volume,
  });

  // Limit the stored volumes to the last 20 candles
  if (volumeStore[timeframe][symbol].length > 60) {
    volumeStore[timeframe][symbol].shift();
  }

  // Calculate relative volume for the timeframe
  calculateRelativeVolume(symbol, timeframe);
}

// Function to calculate relative volume for 1m, 5m, 15m, 1h
function calculateRelativeVolume(symbol, timeframe) {
  const volumes = volumeStore[timeframe][symbol];
  if (volumes.length < 2) return;

  const latestVolume = volumes[volumes.length - 1].volume;
  const averageVolume = volumes.reduce((acc, data) => acc + parseFloat(data.volume), 0) / volumes.length;

  const relativeVolume = latestVolume / averageVolume;



  io.emit('volumeData', {
    symbol,
    timeframe,   // For differentiating the data based on the timeframe
    latestVolume,  // Latest volume in the timeframe
    averageVolume, // Average volume in the timeframe
    relativeVolume, // Relative volume compared to the average
  });






}

// Function to save 24-hour Kline volumes
function save24hrVolume(symbol, kline) {
  if (!kline.final) return;

  if (!volumeStore24hr[symbol]) {
    volumeStore24hr[symbol] = [];
  }

  volumeStore24hr[symbol].push(parseFloat(kline.volume));

  const maxCandles = 60 * 24;
  if (volumeStore24hr[symbol].length > maxCandles) {
    volumeStore24hr[symbol].shift();
  }

  calculateRelativeVolume24hr(symbol);
}

// Function to calculate relative volume for 24 hours
function calculateRelativeVolume24hr(symbol) {
  const volumes = volumeStore24hr[symbol];
  if (volumes.length < 2) return;

  const latestVolume = volumes[volumes.length - 1];
  const averageVolume = volumes.reduce((acc, volume) => acc + volume, 0) / volumes.length;

  const relativeVolume = latestVolume / averageVolume;

  io.emit('volumeData24hr', {
    symbol,
    latestVolume,
    averageVolume,
    relativeVolume,
  });
}

// Subscribe to all symbols and timeframes
async function subscribeAllSymbols() {
  try {
    const usdmClient = new USDMClient({
      api_key: API_KEY,
      api_secret: API_SECRET,
    });

    const exchangeInfo = await usdmClient.getExchangeInfo();
    const symbols = exchangeInfo.symbols.map((s) => s.symbol);

    const timeframes = ["1m", "5m", "15m", "1h"];
    symbols.forEach((symbol) => {
      timeframes.forEach((tf) => {
        wsClient.subscribeKlines(symbol, tf, "usdm");
      });

      // Subscribe to 1m for 24-hour tracking
      wsClient.subscribeKlines(symbol, "1m", "usdm");
    });
  } catch (error) {
    console.error("Error subscribing to symbols:", error);
  }
}

// WebSocket event handling
wsClient.on('formattedMessage', (data) => {
  if (data.eventType === "kline" && data.kline) {
    const {
      symbol,
      kline: { interval, ...kline },
    } = data;

    if (["1m", "5m", "15m", "1h"].includes(interval)) {
      saveKlineVolume(symbol, interval, kline);
    }

    if (interval === "1m") {
      save24hrVolume(symbol, kline);
    }
  }
});

wsClient.on('open', (data) => {
  console.log('WebSocket connection opened:', data.wsKey);
});

wsClient.on('error', (err) => {
  console.error('WebSocket Error:', err);
});

// Start subscription
subscribeAllSymbols();

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});




