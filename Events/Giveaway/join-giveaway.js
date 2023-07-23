const { ButtonInteraction, Client, EmbedBuilder } = require("discord.js");
const DB = require("../../Schemas/giveawayDB");

module.exports = {
    name: "interactionCreate",
    /**
     * @param {ButtonInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
    const roleMenuIds = ['rolemenu','delete','cancel','yes','no','reply'];
    if (roleMenuIds.includes(interaction.customId?.replace(/[0-9]/g,""))) return;
        if (!interaction.isButton()) return;
        if (interaction.customId !== "giveaway-join") return;

        const embed = new EmbedBuilder();
        const data = await DB.findOne({
            GuildID: interaction.guild.id,
            ChannelID: interaction.channel.id,
            MessageID: interaction.message.id
        });

        if (!data) {
            embed
                .setcolor("FF0000")
                .setDescription("There is no data in the database");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (data.Entered.includes(interaction.user.id)) {
            embed
                .setcolor("FF0000")
                .setDescription("You have already joined the giveaway");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (data.Paused === true) {
            embed
                .setcolor("FF0000")
                .setDescription("This giveaway is paused");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (data.Ended === true) {
            embed
                .setcolor("FF0000")
                .setDescription("This giveaway has ended");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await DB.findOneAndUpdate({
            GuildID: interaction.guild.id,
            ChannelID: interaction.channel.id,
            MessageID: interaction.message.id
        }, {
            $push: { Entered: interaction.user.id }
        }).then(() => {
            embed
                .setColor("008000")
                .setDescription("You have joined the giveaway");
            return interaction.reply({ embeds: [embed], ephemeral: true });
        });
    }
};