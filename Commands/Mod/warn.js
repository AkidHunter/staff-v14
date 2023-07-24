const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
} = require("discord.js");
const { Types } = require("mongoose");

const warnSchema = require("../../Schemas/warnSchema");
const modSchema = require("../../Schemas/modSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setName("warn")
    .setDescription("warn a user or remove a warn")
    .addSubcommand((subCmd) =>
      subCmd
        .setName("add")
        .setDescription("warn a user")
        .addUserOption((option) => {
          return option
            .setName("user")
            .setDescription("The user to warn")
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
              .setName("warn_duration")
              .setDescription("Select a type.")
              .setRequired(true)
              .addChoices({
                  name: "1 Week",
                  value: "1 Week",
              })
              .addChoices({
                  name: "2 Weeks",
                  value: "2 Weeks",
              })
              .addChoices({
                  name: "3 Weeks",
                  value: "3 Weeks",
              })
              .addChoices({
                  name: "4 Weeks",
                  value: "4 Weeks",
              })
          })
        .addStringOption((option) => {
          return option
            .setName("reason")
            .setDescription("The reason for the warn")
            .setRequired(true)
            .setMaxLength(500);
        })
    )
    .addSubcommand((subCmd) =>
      subCmd
        .setName("remove")
        .setDescription("Remove a warn from a user")
        .addStringOption((option) => {
          return option
            .setName("warn_id")
            .setDescription("The id of the warn to remove")
            .setRequired(true);
        })
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    switch (interaction.options.getSubcommand()) {
      case "add":
        {
          const { options, guild, member } = interaction;
          const user = options.getUser("user");
          const type = options.getInteger("type");
          const reason = options.getString("reason");
          const warnDuration = options.getString("warn_duration");
          const warnTime = new Date();

          const weeks = parseInt(warnDuration.split(" ")[0]);
          const expiryDate = new Date(warnTime.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);

          let totalWarnings = 0;
          try {
              const warnings = await warnSchema.find({ guildId: guild.id, userId: user.id });
              const currentTime = new Date();
              totalWarnings = warnings.filter(warning => warning.warnExpiryDate > currentTime).length;
          } catch (err) {
              console.log(err);
          }

          const newSchema = new warnSchema({
            _id: Types.ObjectId(),
            guildId: guild.id,
            userId: user.id,
            warnReason: reason,
            moderator: member.user.id,
            warnDate: warnTime,
            warnType: type,
            warnExpiryDate: expiryDate,
            totalWarnings: totalWarnings,
          });

          newSchema.save().catch((err) => console.log(err));

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("User warned!")
                .setDescription(
                  `<@${user.id}> has been warned for \`${reason}\`!`
                )
            ],
            ephemeral: true,
          });

          const modData = await client.channels.cache.get('1060557571817218129');
          const data = await warnSchema.findOne({
            guildId: guild.id,
            userId: user.id,
          });

          if (modData) {
            modData.send({
              embeds: [
                new EmbedBuilder().setTitle(":warning: Warning issued :warning:").addFields(
                  {
                    name: "Staff:",
                    value: `<@${user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Warned by:",
                    value: `<@${member.user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Warn ID:",
                    value: `\`${data._id}\``,
                    inline: true,
                    },
                  {
                    name: "Date issued:",
                    value: `<t:${Math.floor(warnTime.getTime() / 1000)}:f>`,
                    inline: true,
                  },
                  {
                    name: "Date of expiry:",
                    value: `<t:${Math.floor(expiryDate.getTime() / 1000)}:f>`,
                    inline: true,
                  },
                  {
                    name: "Total warnings:",
                    value: `\`${totalWarnings}\``,
                    inline: true,
                  },
                  {
                    name: "Reason of warn:",
                    value: `\`\`\`${reason}\`\`\``,
                  }
                ),
              ],
            });
          }
          user
            .send({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`:warning: Discord warn :warning:`)
                  .addFields(
                    {
                      name: "Warned by:",
                      value: `<@${member.user.id}>`,
                      inline: true,
                    },
                    {
                      name: "Date issued:",
                      value: `<t:${Math.floor(warnTime.getTime() / 1000)}:f>`,
                      inline: true,
                    },
                    {
                      name: "Date of expiry:",
                      value: `<t:${Math.floor(expiryDate.getTime() / 1000)}:f>`,
                      inline: true,
                    },
                    {
                      name: "Reason of warn:",
                      value: `\`\`\`${reason}\`\`\``,
                    }
                  )
                  .setColor("#2f3136"),
              ],
            })
            .catch(async (err) => {
              console.log(err);
              await interaction.followUp({
                embeds: [
                  new EmbedBuilder()
                    .setTitle("User has dms disabled so no DM was sent.")
                    .setcolor("FF0000"),
                ],
              });
            });
        }
        break;

      case "remove": {
        const warnId = interaction.options.getString("warn_id");

        const data = await warnSchema.findById(warnId);

        const err = new EmbedBuilder().setDescription(
          `No warn Id watching \`${warnId}\` was found!`
        );

        if (!data) return await interaction.reply({ embeds: [err] });

        data.delete();

        const embed = new EmbedBuilder()
          .setTitle("Remove Infraction")
          .setDescription(
            `Successfully removed the warn with the ID matching ${warnId}`
          );
        return await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
