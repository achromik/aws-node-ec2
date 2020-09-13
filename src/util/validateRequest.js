exports.body = (req, schema) => {
  const options = {
    abortEarly: false, //include all errors
    allowUnknown: true, //ignore unknown props
    stripUnknown: true, //remove unknown props
  };
  return schema.validateAsync(req.body, options);
};
