const { Schema, model } = require("mongoose");

const strikeSchema = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,
  userId: String,
  strikeReason: String,
  strikeDate: String,
  strikeType: Number,
  totalStrikes: Number,
  moderator: String,
});

module.exports = model("strikingSchema", strikeSchema, "userStrikes");
