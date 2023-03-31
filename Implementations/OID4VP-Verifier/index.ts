import express from 'express';
var cors = require('cors');

import dotenv from 'dotenv';
const routes = require('./src/routes/index');
var bodyParser = require('body-parser')
dotenv.config();

const app = express();
const port = process.env.PORT;
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', routes);
app.use(bodyParser.json({ type: 'application/*+json' }))





app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});