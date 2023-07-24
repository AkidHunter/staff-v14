const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} = require("discord.js");

const strikeSchema = require("../../Schemas/strikeSchema"); // change this to your path if needed.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("strike-logs")
    .setDescription("Get the strikes of a user")
        .addUserOption((option) => {
          return option
            .setName("user")
            .setDescription("User to get the strike logs for")
            .setRequired(true);
        })
        .addIntegerOption((option) => {
          return option
            .setName("page")
            .setDescription("The page to display if there are more than 1")
            .setMinValue(2)
            .setMaxValue(20);
        }),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
        const user = interaction.options.getUser("user");
        const page = interaction.options.getInteger("page");

        const userstrikeings = await strikeSchema.find({
          userId: user.id,
          guildId: interaction.guild.id,
        });

        if (!userstrikeings?.length)
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("User strike Logs")
                .setDescription(`${user} has no strike logs`)
                .setColor("FF0000"),
            ],
          });

        const embed = new EmbedBuilder()
          .setTitle(`${user.username}'s strike logs`)
          .setColor("#2f3136");

        if (page) {
          const pageNum = 5 * page - 5;

          if (userstrikeings.length >= 6) {
            embed.setFooter({
              text: `page ${page} of ${Math.ceil(userstrikeings.length / 5)}`,
            });
          }

          for (const strikeings of userstrikeings.splice(pageNum, 5)) {
            const moderator = interaction.guild.members.cache.get(
              strikeings.moderator
            );

          const strikedUser = users.get(strikeings.userId);
          const strikedUserMention = strikedUser ? `<@${strikedUser.user.id}>` : "User left";

            embed.addFields({
              name: `Strike ID: ${strikeings._id}`,
              value: `
                :information_source: Issued by: ${
                  moderator || "Moderator left"
                }
                :information_source: Staff: ${strikedUserMention}
                :information_source: Strike reason: \`${
                  strikeings.strikeReason
                }\`
                :information_source: Type of strike: \`${strikeings?.strikeType?.toString()
                }\`
                :information_source: Date of issued strike: ${strikeings.strikeDate}
                `,
            });
          }

          return await interaction.reply({ embeds: [embed] });
        }

        if (userstrikeings.length >= 6) {
          embed.setFooter({
            text: `page 1 of ${Math.ceil(userstrikeings.length / 5)}`,
          });
        }

        const userIds = userstrikeings.map(strikes => strikes.userId);
        const users = await interaction.guild.members.fetch({user: userIds});

        for (const strikes of userstrikeings.slice(0, 5)) {
          const moderator = interaction.guild.members.cache.get(
            strikes.moderator
          );

        const strikedUser = users.get(strikes.userId);
        const strikedUserMention = strikedUser ? `<@${strikedUser.user.id}>` : "User left";

          embed.addFields({
            name: `Strike ID: ${strikes._id}`,
            value: `
            :information_source: Issued by: ${
              moderator || "Moderator left"
            }
            :information_source: Staff: ${strikedUserMention}
            :information_source: Reason for strike: \`${
              strikes.strikeReason
            }\`
            :information_source: Type of strike: \`${strikes?.strikeType?.toString() || "No type provided"
          }\`
            :information_source: Date of issued strike: ${strikes.strikeDate}
            `,
          });
        }

        return await interaction.reply({ embeds: [embed] });
      },
    }
