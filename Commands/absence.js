const { CommandInteraction, EmbedBuilder, SlashCommandBuilder,  } = require("discord.js");
const suggestDB = require("../schemas/absence");
const suggestSetupDB = require("../schemas/absenceSetup");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("absence")
        .setDescription("Create an absence request.")
        .addStringOption((options) =>
            options
                .setName("type")
                .setDescription("Select a type.")
                .setRequired(true)
                .addChoices({
                    name: "Sick",
                    value: "Sick",
                })
                .addChoices({
                    name: "Traveling",
                    value: "Traveling",
                })
                .addChoices({
                    name: "Other",
                    value: "Other",
                })
        )
        .addStringOption((options) =>
            options
                .setName("explanation")
                .setDescription("Describe your absence request.")
                .setRequired(true)
        )
        .addStringOption((options) =>
            options
                .setName("length")
                .setDescription("Describe your absence length.")
                .setRequired(true)
        )
        .addBooleanOption((options) =>
            options
                .setName("dm")
                .setDescription(
                    "Set whether the bot will DM you, once your absence request has been declined or accepted."
                )
                .setRequired(true)
        ),
    /**
     * @param {CommandInteraction} interaction 
     */
     async execute(interaction, client) {
        
        const { options, guildId, member, user } = interaction;

        const type = options.getString("type");
        const explanation = options.getString("explanation");
        const length = options.getString("length")
        const DM = options.getBoolean("dm")

        const absenceSetup = await suggestSetupDB.findOne({ GuildID: guildId });
        var absenceChannel;

        if (!absenceSetup) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ This server has not setup the absent system.`)] })
        } else {
            absenceChannel = interaction.guild.channels.cache.get(absenceSetup.ChannelID)
        }

        if (absenceSetup.Disabled)
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ Absents are currently disabled.`)] })

        if (absenceSetup.ChannelID === "None")
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ The absent channel hasn't been set.`)] })


        const Embed = new EmbedBuilder()
            .setColor("FFA500")
            .setDescription(`**Absence Request:**\n ${interaction.user.tag}`)
            .addFields({ name: "Type", value: type, inline: true }, { name: "Status", value: "🕐 Pending", inline: true }, { name: "Length", value: length, inline: true }, { name: "Explanation", value: explanation, inline: true }, )

        try {
            const M = await absenceChannel.send({ embeds: [Embed]});


            await suggestDB.create({
                GuildID: guildId,
                MessageID: M.id,
                Details: [{
                    MemberID: member.id,
                    Type: type,
                    Explanation: explanation,
                    Length: length,
                }],
                MemberID: member.id,
                DM: DM,
                UpvotesMembers: [],
                DownvotesMembers: [],
                InUse: false,
            })
            interaction.reply({ embeds: [new EmbedBuilder().setColor("FFA500").setDescription(`✅ Hey ${interaction.user.tag},Your absence was successfully created and sent to be reviewed by an Admin+`)], ephemeral: true})
        } catch (err) {
            console.log(err);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ An error occured.`)] })
        }
    }
}