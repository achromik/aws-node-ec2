const bunyan = require('bunyan');

const log = bunyan.createLogger({
  name: 'ec2-app',
  serializers: {
    err: bunyan.stdSerializers.err,
    req: require('bunyan-express-serializer'),
    res: bunyan.stdSerializers.res,
  },
});

if (process.env.NODE_ENV === 'test') {
  log.level(bunyan.FATAL + 1);
}

const logResponse = function (id, body, statusCode) {
  const log = this.log.child(
    {
      id: id,
      statusCode: statusCode,
      body: body,
    },
    true
  );
  log.info('response');
};

const logRequest = function (req) {
  const log = this.log.child(
    {
      id: req.id,
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers,
    },
    true
  );
  log.info('request');
};

module.exports = { log, logRequest, logResponse };
