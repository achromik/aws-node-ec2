const bunyan = require('bunyan');
const reqSerialzer = require('bunyan-express-serializer');

const { common } = require('./constants');

const log = bunyan.createLogger({
  name: 'ec2-app',
  serializers: {
    err: bunyan.stdSerializers.err,
    req: reqSerialzer,
    res: bunyan.stdSerializers.res,
  },
});

if (process.env.NODE_ENV === 'test') {
  log.level(bunyan.FATAL + 1);
}

function logResponse(id, body, statusCode) {
  const logger = this.log.child(
    {
      id,
      statusCode,
      body,
    },
    true
  );
  logger.info(common.RESPONSE);
}

function logRequest(req) {
  const logger = this.log.child(
    {
      id: req.id,
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers,
    },
    true
  );
  logger.info(common.REQUEST);
}

module.exports = { log, logRequest, logResponse };
