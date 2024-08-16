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
  const { userName, passWord } = req.body;
  if (!userName || !passWord) {
    return res.status(400).send('userName and passWord are required');
  }

  try {
    const result = await sql.query`INSERT INTO dbo.usersTest (userName, passWord) VALUES (${userName}, ${passWord})`;
    console.log('Data inserted successfully:', result);
    res.status(201).send('Data inserted successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
});

app.post('/createTable', async (req, res) => {
  const { tableName } = req.body;
  if (!tableName) {
    return res.status(400).send('Table name is required');
  }

  const createTableQuery = `
    CREATE TABLE dbo.${tableName} (
      userName NVARCHAR(50) NOT NULL,
      passWord NVARCHAR(50) NOT NULL
    )
  `;

  try {
    const result = await sql.query(createTableQuery);
    console.log('Table created successfully:', result);
    res.status(201).send(`Table '${tableName}' created successfully`);
  } catch (err) {
    console.error('Error creating table:', err);
    res.status(500).send('Error creating table');
  }
});

// Define a route to handle login
app.post('/login', async (req, res) => {
  const { userName, passWord } = req.body;
  if (!userName || !passWord) {
    return res.status(400).send('userName and passWord are required');
  }

  try {
    // Query the database to find the user
    const result = await sql.query`SELECT * FROM dbo.usersTest WHERE userName = ${userName}`;
    
    if (result.recordset.length === 0) {
      return res.status(404).send('User not found');
    }

    // Check if the provided password matches the stored password
    const user = result.recordset[0];
    if (user.passWord !== passWord) {
      return res.status(401).send('Invalid password');
    }

    // If password matches, send a success response
    res.status(200).send('Login successful');
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error during login');
  }
});

app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});