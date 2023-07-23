const {
  MessageEmbed,
  CommandInteraction,
  Client,
  CommandInteractionOptionResolver,
  SlashCommandBuilder
} = require("discord.js");

const db = require("../../Schemas/logs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Set up the log system")
    .addChannelOption((option) => {
      return option
        .setName("message")
        .setDescription(
          "The channel where the logs related to message will be sent."
        )
        .setRequired(false);
    })
    .addChannelOption((option) => {
      return option
        .setName("role")
        .setDescription(
          "The channel where the logs related to role will be sent."
        )
        .setRequired(false);
    })
    .addChannelOption((option) => { 
      return option
        .setName("member")
        .setDescription(
          "The channel where the logs related to member will be sent."
        )
        .setRequired(false);
    })
    .addChannelOption((option) => {
      return option
        .setName("channel")
        .setDescription(
          "The channel where the logs related to channel will be sent."
        )
        .setRequired(false);
    }),

  /**
   *
   * @param {CommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    const { options } = interaction;
    const message = options.getChannel("message");
    const role = options.getChannel("role");
    const member = options.getChannel("member");
    const channel = options.getChannel("channel");

    const data = await db.findOne({
      guild: interaction.guild.id,
    });

    const info = {
      message: message ? message.id : data?.info?.message || null,
      role: role ? role.id : data?.info?.role || null,
      member: member ? member.id : data?.info?.member || null,
      channel: channel ? channel.id : data?.info?.channel || null,
    };

    if (!data) {
      await db.create({
        guild: interaction.guild.id,
        info,
      });
    } else {
      data.info = info;
      data.save();
    }

    const details = Object.entries(info)
      .map((entry) => {
        const [key, value] = entry;
        if (!value) return;
        return `**${key}** => <#${value}>`;
      })
      .filter((e) => e)
      .join("\n");

    await interaction.reply({
      content: `The logs channels has been updated! Info:\n${details}`,
      ephemeral: true,
    });
  },
};
