const bunyan = require('bunyan');

exports.log = bunyan.createLogger({
  name: 'ec2-app',
  serializers: {
    err: bunyan.stdSerializers.err,
    req: require('bunyan-express-serializer'),
    res: bunyan.stdSerializers.res,
  },
});

exports.logResponse = function (id, body, statusCode) {
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

exports.logRequest = function (req) {
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
