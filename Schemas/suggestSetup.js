const { model, Schema } = require('mongoose');

module.exports = model("suggestSetupDB", new Schema({
    GuildID: String,
    ChannelID: String,
    SuggestionManagers: Array,
    AllowOwnSuggestionDelete: Boolean,
    Disabled: Boolean,
}))