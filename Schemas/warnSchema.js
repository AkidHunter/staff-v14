const { Schema, model } = require("mongoose");

const warnSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,
  userId: String,
  warnReason: String,
  warnDate: Date,
  warnType: Number,
  warnExpiryDate: Date,
  totalWarnings: Number,
  moderator: String,
});

module.exports = model("warningSchema", warnSchema, "userwarns");
