const { CommandInteraction, EmbedBuilder, SlashCommandBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const absenceDB = require("../schemas/absence");
const absenceSetupDB = require("../schemas/absenceSetup");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("absence")
    .setDescription("Create an absence request.")
    .addSubcommand((subcommand) =>
        subcommand
            .setName("create")
            .setDescription("Create an absence request.")
    ),

/**
     * @param {CommandInteraction} interaction
     */
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "create": {
                const typeInput = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("absence-type")
                        .setLabel("Absence Type")
                        .setPlaceholder("E.g., Sick, Traveling, Other")
                        .setRequired(true)
                );

                const explanationInput = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("absence-explanation")
                        .setLabel("Explanation")
                        .setStyle(TextInputStyle.Long)
                        .setRequired(true)
                );

                const lengthInput = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("absence-length")
                        .setLabel("Absence Length")
                        .setPlaceholder("Example: 1d for 1 day, 1M for 1 month")
                        .setRequired(true)
                );

                const dmOption = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("absence-dm")
                        .setLabel("DM me when reviewed")
                        .setStyle("PRIMARY")
                );

                const modal = new ModalBuilder()
                    .setCustomId("absence-options")
                    .setTitle("Create an Absence Request")
                    .setComponents(typeInput, explanationInput, lengthInput, dmOption);

                await interaction.showModal(modal);
            }
                break;

        const absenceSetup = await absenceSetupDB.findOne({ GuildID: guildId });
        var absenceChannel;

        if (!absenceSetup) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ This server has not setup the absent system.`)] });
        } else {
            absenceChannel = interaction.guild.channels.cache.get(absenceSetup.ChannelID);
        }

        if (absenceSetup.Disabled) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ Absents are currently disabled.`)] });
        }

        if (absenceSetup.ChannelID === "None") {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ The absent channel hasn't been set.`)] });
        }

        try {
            const M = await absenceChannel.send({ embeds: [Embed] });
            await absenceDB.create({
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
                InUse: false,
            });
            interaction.reply({ embeds: [new EmbedBuilder().setColor("FFA500").setDescription(`✅ Hey ${interaction.user},Your absence was successfully created and sent to be reviewed by an Admin+`)], ephemeral: true });
        } catch (err) {
            console.log(err);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ An error occurred.`)] });
        }
    }
};