module.exports = (details) =>
  details
    .map((x) => x.message)
    .join(', ')
    .replace(/"/g, "'");
