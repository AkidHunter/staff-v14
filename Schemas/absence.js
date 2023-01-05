const { model, Schema } = require('mongoose');

module.exports = model("absenceDB", new Schema({
    GuildID: String,
    MessageID: String,
    Details: Array,
    MemberID: String,
    DM: Boolean,
    InUse: Boolean,
}))