# Car Market Data Processor

## Description
This Node.js application fetches live data from multiple APIs related to the second-hand car market, processes and enriches the data, and generates a detailed report analyzing various aspects such as price differences, mileage, and market trends.

## Features
- Fetches car data, market average prices, and currency exchange rates.
- Enriches car data with price and mileage differences and USD price conversion.
- Saves processed data to a JSON file.
- Answers key market analysis questions and prints results to the terminal.
- Measures and displays total execution time.

## Setup Instructions

1. Clone the repository:

   git clone 
   cd
   
2. Install dependencies:
   
   npm install axios
   
## Running the Application

Run the application using:

npm start

This will fetch the data, process it, save the enriched data to `cars_data.json`, and print analysis results along with execution time.

## Project Structure

- `index.js`: Main entry point containing all logic.
- `cars_data.json`: Output file with processed car data.
- `.gitignore`: Excludes `node_modules/` from git.

## Dependencies

- [axios](https://www.npmjs.com/package/axios) for HTTP requests
- Node.js built-in `fs/promises` for file operations