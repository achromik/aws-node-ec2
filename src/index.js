const express = require('express');
const app = express();

const { log } = require('./config/logger');
const { connectDB } = require('./config/db');

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => log.info(`Listening on port ${port}!`));
