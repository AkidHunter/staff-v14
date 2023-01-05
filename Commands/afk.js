const { CommandInteraction, EmbedBuilder, color, SlashCommandBuilder } = require("discord.js");
const DB = require("../schemas/afksystem");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Set your AFK status.")
    .addSubcommand((subcommand) =>
        subcommand
        .setName("set")
        .setDescription("Set your AFK status")
        .addStringOption((option) =>
            option
            .setName("status")
            .setDescription("Set your status")
            .setRequired(true)
        )
    ),
    
    /**
     * 
     * @param {CommandInteraction} interaction 
     */
    async execute(interaction) {
        const { guild, options, user, createdTimestamp } = interaction;

        const Embed = new EmbedBuilder()
        .setAuthor({ name: user.tag })

        const afkStatus = options.getString("status");

        try {

            switch(options.getSubcommand()) {
                case "set" : {
                    await DB.findOneAndUpdate(
                        {GuildID: guild.id, UserID: user.id},
                        {Status: afkStatus, Time: parseInt(createdTimestamp / 1000)},
                        {new: true, upsert: true}
                    )
                    
                    Embed.setColor("Color.GREEN").setDescription(`Your AFK status has been updated to: ${afkStatus}`);
                    return interaction.reply({embeds: [Embed], ephemeral: true})
                }
                case "return" : {
                    await DB.deleteOne({GuildID: guild.id, UserID: user.id});

                    Embed.setColor("Color.RED").setDescription(`Your AFK status has been removed.`);
                    return interaction.reply({embeds: [Embed], ephemeral: true})
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}