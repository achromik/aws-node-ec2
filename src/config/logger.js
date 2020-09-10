const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'ec2-app' });

module.exports = { log };
