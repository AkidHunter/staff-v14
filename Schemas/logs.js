const { model, Schema } = require("mongoose");

module.exports = model(
  "logs",
  new Schema({
    guild: String,
    info: Object,
  })
);
