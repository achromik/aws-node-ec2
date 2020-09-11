const express = require('express');
const app = express();
const addRequestId = require('express-request-id')();

const AppLogger = require('./config/logger');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addRequestId);

app.use((req, res, next) => {
  AppLogger.logRequest(req);

  next();
});

app.use((req, res, next) => {
  const afterResponse = () => {
    res.removeListener('finish', afterResponse);
    res.removeListener('close', afterResponse);
    const log = AppLogger.log.child(
      {
        id: req.id,
      },
      true
    );
    log.info({ res }, 'response');
  };

  res.on('finish', afterResponse);
  res.on('close', afterResponse);

  next();
});

app.get('/', (req, res, next) => {
  res.json({ message: 'Welcome' });
});

app.post('/status', (req, res, next) => {
  res.send({ data: req.body });
});

app.use((req, res, next) => {
  const response = { status: 404, error: 'Not found' };
  AppLogger.log.warn({ id: req.id, path: req.path }, 'Not Found');

  res.status(404).send(response);
});

app.use((error, req, res, next) => {
  AppLogger.log.error({ err: error, req });

  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || 'Internal Server Error',
    },
  });
  next();
});

module.exports = app;
