const mongoose = require('mongoose');

const AppLogger = require('./logger');

const db = process.env.DB;
let dbInstance = null;

exports.connectDB = async () => {
  if (!db) {
    throw new Error('Missing database uri in .env file');
  }

  if (dbInstance) {
    AppLogger.log.info('Using existing database connection');

    return Promise.resolve(dbInstance);
  }

  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    AppLogger.log.info('MongoDB connected...');

    dbInstance = mongoose.connection;
    return Promise.resolve(dbInstance);
  } catch (err) {
    AppLogger.log.error(err.message);

    throw new Error(err.message);
  }
};
