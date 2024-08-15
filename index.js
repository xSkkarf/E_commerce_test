const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

const config = require('./dataBaseConfig');

// Connect to SQL Server
sql.connect(config).then(pool => {
  if (pool.connected) {
    console.log('Connected to SQL Server');
  }
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Define a route to get data
app.get('/getData', async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM dbo.FlutterTest');
    console.log('Query executed successfully:', result);
    if (result.recordset.length === 0) {
      console.log('No data found in the table.');
    }
    res.json(result.recordset); // Send data as JSON response
  } catch (err) {
    console.error('Error retrieving data:', err);
    res.status(500).send('Error retrieving data');
  }
});

// Define a route to add data
app.post('/setData', async (req, res) => {
  const { userName, userEmail } = req.body;
  if (!userName || !userEmail) {
    return res.status(400).send('userName and userEmail are required');
  }

  try {
    const result = await sql.query`INSERT INTO dbo.FlutterTest (userName, userEmail) VALUES (${userName}, ${userEmail})`;
    console.log('Data inserted successfully:', result);
    res.status(201).send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});

app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});