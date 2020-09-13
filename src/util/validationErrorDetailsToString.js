module.exports = (details) => {
  if (!details) {
    throw new Error('Missing argument');
  }

  if (!Array.isArray(details)) {
    throw new Error('Invalid argument. Should be an array');
  }

  return details
    .map((x) => x.message)
    .join(', ')
    .replace(/"/g, "'");
};
