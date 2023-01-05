const {
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  Client,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const suggestDB = require("../schemas/suggest");
const suggestSetupDB = require("../schemas/suggestSetup");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Create a suggestion.")
    .addStringOption((options) =>
      options
        .setName("type")
        .setDescription("Select a type.")
        .setRequired(true)
        .addChoices({
          name: "Client",
          value: "Client",
        })
        .addChoices({
          name: "Event",
          value: "Event",
        })
        .addChoices({
          name: "Discord",
          value: "Discord",
        })
        .addChoices({
          name: "Other",
          value: "Other",
        })
    )
    .addStringOption((options) =>
      options
        .setName("suggestion")
        .setDescription("Describe your suggestion.")
        .setRequired(true)
    )
    .addBooleanOption((options) =>
      options
        .setName("dm")
        .setDescription(
          "Set whether the bot will DM you, once your suggestion has been declined or accepted."
        )
        .setRequired(true)
    ),

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async execute(interaction, client) {
    const { guildId, member, user, options } = interaction;

    const suggestionsSetup = await suggestSetupDB.findOne({ GuildID: guildId });
    let suggestionsChannel;

    if (!suggestionsSetup) {
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(
            `❌ This server has not setup the suggestion system.`
          ),
        ],
      });
    } else {
      suggestionsChannel = interaction.guild.channels.cache.get(
        suggestionsSetup.ChannelID
      );
    }

    if (suggestionsSetup.Disabled)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(
            `❌ Suggestions are currently disabled.`
          ),
        ],
      });

    if (suggestionsSetup.ChannelID === "None")
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(
            `❌ The suggestion channel hasn't been set.`
          ),
        ],
      });

    const type = options.getString("type");
    const suggestion = options.getString("suggestion");
    const DM = options.getBoolean("dm");

    const Embed = new EmbedBuilder()

      .setDescription(`**Suggestion:**\n${suggestion}`)
      .addFields(
        { name: "Type", value: type, inline: true },
        { name: "Status", value: "🕐 Pending", inline: true },
        { name: "Reason", value: "Pending", inline: true }
      )
      .addFields(
        { name: "Upvotes", value: "0", inline: true },
        { name: "Downvotes", value: "0", inline: true },
        { name: "Overall votes", value: "0", inline: true }
      )
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("suggestion-upvote")
        .setLabel(`Upvote`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("suggestion-downvote")
        .setLabel(`Downvote`)
        .setStyle(ButtonStyle.Primary)
    );

    try {
      const M = await suggestionsChannel.send({
        embeds: [Embed],
        components: [buttons],
      });

      await suggestDB.create({
        GuildID: guildId,
        MessageID: M.id,
        Details: [
          {
            MemberID: member.id,
            Type: type,
            Suggestion: suggestion,
          },
        ],
        MemberID: member.id,
        DM: DM,
        UpvotesMembers: [],
        DownvotesMembers: [],
        InUse: false,
      });
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(
            `✅ Hey ${interaction.user.tag}, Your [suggestion](${M.url}) was successfully created and sent to ${suggestionsChannel}`
          ),
        ],
      });
    } catch (err) {
      console.log(err);
      return await interaction.reply({
        ephemeral: true,
        embeds: [new EmbedBuilder().setDescription(`❌ An error occured.`)],
      });
    }
  },
};
