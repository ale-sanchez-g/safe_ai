const express = require('express');
const csv = require('csvtojson');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const getLatestCsvFile = (dir) => {
  const files = fs.readdirSync(dir)
    .filter(file => file.endsWith('.csv'))
    .map(file => ({
      file,
      time: fs.statSync(path.join(dir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  return files.length ? path.join(dir, files[0].file) : null;
};

const processCsvData = async () => {
  const csvFilePath = getLatestCsvFile(path.join(__dirname, 'temp'));
  if (!csvFilePath) {
    throw new Error('No CSV files found in the temp directory');
  }

  const jsonArray = await csv().fromFile(csvFilePath);

  // Remove the first two header rows
  const [, , ...dataRows] = jsonArray;

  // Adjust the keys
  return dataRows.map(row => ({
    Postcode: row['Offenders of Theft (Break & enter dwelling) on Residential Premises from October 2022 to September 2024'],
    Trend: row['field2'],
    Count1: row['field3'],
    Rate1: row['field4'],
    Count2: row['field5'],
    Rate2: row['field6']
  }));
};

app.get('/', async (req, res) => {
    // Welcome message and instructions with links to the data
    const message = `
    <h1>Welcome to the CSV Data API</h1>
    <p>Use the following routes to access the data:</p>
    <ul>
      <li><a href="/data">/data</a> - Get all data</li>
      <li><a href="/data/search?postcode=2000">/data/search?postcode=2000</a> - Search data by postcode</li>
    </ul>
    `;
    res.send(message);
  });

app.get('/data', async (req, res) => {
  try {
    const formattedData = await processCsvData();
    res.json(formattedData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/data/search', async (req, res) => {
  const { postcode } = req.query;
  try {
    const formattedData = await processCsvData();
    const result = postcode ? formattedData.filter(row => row.Postcode === postcode) : formattedData;
    res.json(result);
    console.info(`Server is returning data for postcode: ${postcode}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});