const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true }
);

const Role = mongoose.model('Role', RoleSchema);

module.exports = Role;
