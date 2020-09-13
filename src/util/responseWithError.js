exports.responseWithError = (status, message) => (res) =>
  res.status(status).send({ error: { statusCode: status, message } });
