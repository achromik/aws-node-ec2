module.exports = {
  secret: process.env.SECRET,
  expiresIn: parseInt(process.env.JWT_TTL),
};
