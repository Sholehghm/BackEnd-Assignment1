// index.js
const axios = require('axios');
const fs = require('fs/promises');

const startTime = Date.now();

// 1. Fetch Data Functions

async function getCarsData() {
  try {
    const response = await axios.get('https://lm-models.s3.ir-thr-at1.arvanstorage.ir/cars.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching cars data:', error.message);
    return [];
  }
}

async function getMarketPriceData() {
  try {
    const response = await axios.get('https://lm-models.s3.ir-thr-at1.arvanstorage.ir/market_prices.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching market price data:', error.message);
    return [];
  }
}

async function getCurrencyData() {
  try {
    const response = await axios.get('https://baha24.com/api/v1/price');
    return response.data;
  } catch (error) {
    console.error('Error fetching currency data:', error.message);
    return null;
  }
}

// 2. Data Processing

function enrichCarsData(cars, marketPrices, currencyData) {
  if (!currencyData || !currencyData.USD || !currencyData.USD.buy) {
    console.warn('Currency data missing or invalid, USD conversion will be skipped.');
  }
  const rialToUsdRate = currencyData?.USD?.buy || 1;

  return cars.map(car => {
    // Find matching market price entry
    const marketEntry = marketPrices.find(mp =>
      mp.brand === car.brand &&
      mp.model === car.model &&
      mp.year === car.year
    );

    const price_diff_from_average = marketEntry ? car.price - marketEntry.average_price : 0;
    const mileage_diff_from_average = marketEntry ? car.mileage - marketEntry.average_mileage : 0;
    const price_usd = rialToUsdRate !== 0 ? car.price / rialToUsdRate : 0;

    return {
      ...car,
      price_diff_from_average,
      mileage_diff_from_average,
      price_usd: Number(price_usd.toFixed(2))
    };
  });
}

// 3. Save to JSON

async function saveToFile(filename, data) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving file ${filename}:`, error.message);
  }
}

// 4. Data Analysis Functions

function question1(cars) {
  // Which car brand & model exists the most?
  const freqMap = {};
  cars.forEach(car => {
    const key = `${car.brand} ${car.model}`;
    freqMap[key] = (freqMap[key] || 0) + 1;
  });
  const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
  const [mostCommon, count] = sorted[0] || ['None', 0];
  console.log(`Q1: Most common car brand & model: ${mostCommon} (${count} cars)`);
}

function question2(cars) {
  // Top 3 most expensive cars by brand and model
  const grouped = {};
  cars.forEach(car => {
    const key = `${car.brand} ${car.model}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(car);
  });

  const top3 = Object.entries(grouped)
    .map(([key, arr]) => {
      const maxPrice = Math.max(...arr.map(c => c.price));
      return { key, maxPrice };
    })
    .sort((a, b) => b.maxPrice - a.maxPrice)
    .slice(0, 3);

  console.log('Q2: Top 3 most expensive cars by brand & model:');
  top3.forEach(({ key, maxPrice }, idx) => {
    console.log(`  ${idx + 1}. ${key} - Price: IRR ${maxPrice.toLocaleString()}`);
  });
}

function question3(cars) {
  // USD price difference between most expensive and cheapest car
  if (cars.length === 0) {
    console.log('Q3: No car data available.');
    return;
  }
  const pricesUsd = cars.map(c => c.price_usd);
  const maxUsd = Math.max(...pricesUsd);
  const minUsd = Math.min(...pricesUsd);
  const diff = maxUsd - minUsd;
  console.log(`Q3: USD price difference between most expensive and cheapest car: $${diff.toFixed(2)}`);
}

function question4(cars) {
  // How many cars exist for each color?
  const colorCount = {};
  cars.forEach(car => {
    colorCount[car.color] = (colorCount[car.color] || 0) + 1;
  });
  console.log('Q4: Number of cars per color:');
  Object.entries(colorCount).forEach(([color, count]) => {
    console.log(`  ${color}: ${count}`);
  });
}

function question5(cars) {
  // For each car (brand & model), which one has the lowest price and mileage?
  const grouped = {};
  cars.forEach(car => {
    const key = `${car.brand} ${car.model}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(car);
  });

  console.log('Q5: Lowest price and mileage car per brand & model:');
  Object.entries(grouped).forEach(([key, arr]) => {
    const lowestPriceCar = arr.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
    const lowestMileageCar = arr.reduce((prev, curr) => (curr.mileage < prev.mileage ? curr : prev));
    console.log(`  ${key}:`);
    console.log(`    Lowest Price: IRR ${lowestPriceCar.price.toLocaleString()} (ID: ${lowestPriceCar.id})`);
    console.log(`    Lowest Mileage: ${lowestMileageCar.mileage.toLocaleString()} km (ID: ${lowestMileageCar.id})`);
  });
}

function question6(cars) {
  // Top 5 most fair-priced cars (smallest absolute price_diff_from_average)
  const sorted = [...cars].sort((a, b) =>
    Math.abs(a.price_diff_from_average) - Math.abs(b.price_diff_from_average)
  ).slice(0, 5);

  console.log('Q6: Top 5 most fair-priced cars:');
  sorted.forEach(car => {
    console.log(`  ID: ${car.id} - ${car.brand} ${car.model} (${car.year}) - Price Diff: IRR ${car.price_diff_from_average.toLocaleString()}`);
  });
}

function question7(cars) {
  // Top 5 cars with most fair mileage (smallest absolute mileage_diff_from_average)
  const sorted = [...cars].sort((a, b) =>
    Math.abs(a.mileage_diff_from_average) - Math.abs(b.mileage_diff_from_average)
  ).slice(0, 5);

  console.log('Q7: Top 5 cars with most fair mileage:');
  sorted.forEach(car => {
    console.log(`  ID: ${car.id} - ${car.brand} ${car.model} (${car.year}) - Mileage Diff: ${car.mileage_diff_from_average.toLocaleString()} km`);
  });
}

// Main async function

async function main() {
  console.log('Fetching data...');
  const [cars, marketPrices, currencyData] = await Promise.all([
    getCarsData(),
    getMarketPriceData(),
    getCurrencyData()
  ]);

  if (cars.length === 0) {
    console.error('No cars data to process. Exiting.');
    return;
  }

  console.log('Processing data...');
  const enrichedCars = enrichCarsData(cars, marketPrices, currencyData);

  await saveToFile('cars_data.json', enrichedCars);

  console.log('\n--- Data Analysis ---');
  question1(enrichedCars);
  question2(enrichedCars);
  question3(enrichedCars);
  question4(enrichedCars);
  question5(enrichedCars);
  question6(enrichedCars);
  question7(enrichedCars);

  const endTime = Date.now();
  const executionTime = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`\nExecution completed in ${executionTime} seconds.`);
}

main();
