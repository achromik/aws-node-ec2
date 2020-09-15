const express = require('express');
const app = express();
const addRequestId = require('express-request-id')();

const { common } = require('./config/constants');
const AppLogger = require('./config/logger');
const { baseApiPath } = require('./config/app.config');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const { Router } = require('express');

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
    log.info({ res }, common.RESPONSE);
  };

  res.on('finish', afterResponse);
  res.on('close', afterResponse);

  next();
});

app.get('/', (req, res, next) => {
  res.json({ message: 'Welcome' });
});

authRoutes(app, baseApiPath);
userRoutes(app);

app.use((req, res, next) => {
  const response = { statusCode: 404, message: common.NOT_FOUND };
  AppLogger.log.warn({ id: req.id, path: req.path }, common.NOT_FOUND);

  res.status(404).send({ error: response });
});

app.use((error, req, res, next) => {
  AppLogger.log.error(
    { id: req.id, path: req.path, message: error.message },
    `Error occurred: ${req.path}`
  );

  res.status(error.status || 500).send({
    error: {
      status: error.status || 500,
      message: error.message || common.INTERNAL_SERVER_ERROR,
    },
  });

  next();
});

module.exports = app;
