const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
} = require("discord.js");

const warnSchema = require("../../Schemas/warnSchema"); // change this to your path if needed.

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn-logs")
    .setDescription("Get the warns of a user")
        .addUserOption((option) => {
          return option
            .setName("user")
            .setDescription("User to get the warn logs for")
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

        let pageNum;

        if (page) {
          pageNum = 5 * page - 5;
        }

        const userwarnings = await warnSchema.find({
          userId: user.id,
          guildId: interaction.guild.id,
        });

        if (!userwarnings?.length)
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("User warn Logs")
                .setDescription(`${user} has no warn logs`)
            ],
          });

        const embed = new EmbedBuilder()
          .setTitle(`${user.username}'s warn logs`)
          .setColor("#2f3136");

        if (page) {
          const pageNum = 5 * page - 5;

          if (userwarnings.length >= 6) {
            embed.setFooter({
              text: `page ${page} of ${Math.ceil(userwarnings.length / 5)}`,
            });
          }

          const userIds = userwarnings.map(warns => warns.userId);
          const users = await interaction.guild.members.fetch({user: userIds});
  
          for (const warnings of userwarnings.splice(pageNum, 5)) {
            const moderator = interaction.guild.members.cache.get(warnings.moderator);
          
            const userIds = userwarnings.map(warns => warns.userId);
            const users = await interaction.guild.members.fetch({ user: userIds });
          
            const warndUser = users.get(warnings.userId);
            const warndUserMention = warndUser ? `<@${warndUser.user.id}>` : "User left";
          
            embed.addFields({
              name: `warn ID: ${warnings._id}`,
              value: `
                :information_source: Issued by: ${moderator || "Moderator left"}
                :information_source: Staff: ${warndUserMention}
                :information_source: Reason for warn: \`${warnings.warnReason}\`
                :information_source: Type of warn: \`${warnings?.warnType?.toString()}\`
                :information_source: Date issued: <t:${Math.floor(warnings.warnDate?.getTime() / 1000)}:F>
                :information_source: Date of expiry: <t:${Math.floor(warnings.warnExpiryDate?.getTime() / 1000)}:F>`,
            });
          }

          return await interaction.reply({ embeds: [embed] });
        }

        if (userwarnings.length >= 6) {
          embed.setFooter({
            text: `page 1 of ${Math.ceil(userwarnings.length / 5)}`,
          });
        }

        const userIds = userwarnings.map(warns => warns.userId);
        const users = await interaction.guild.members.fetch({user: userIds});

        for (const warns of userwarnings.splice(pageNum, 5)) {
          const moderator = interaction.guild.members.cache.get(warns.moderator);
        
          const userIds = userwarnings.map(warns => warns.userId);
          const users = await interaction.guild.members.fetch({ user: userIds });
        
          const warndUser = users.get(warns.userId);
          const warndUserMention = warndUser ? `<@${warndUser.user.id}>` : "User left";
        
          embed.addFields({
              name: `warn ID: ${warns._id}`,
            value: `
              :information_source: Issued by: ${moderator || "Moderator left"}
              :information_source: Staff: ${warndUserMention}
              :information_source: Reason for warn: \`${warns.warnReason}\`
              :information_source: Type of warn: \`${warns?.warnType?.toString()}\`
              :information_source: Date issued: <t:${Math.floor(warns.warnDate.getTime() / 1000)}:F>
              :information_source: Date of expiry: <t:${Math.floor(warns.warnExpiryDate.getTime() / 1000)}:F>`,
          });
        }

        return await interaction.reply({ embeds: [embed] });
      },
    }
