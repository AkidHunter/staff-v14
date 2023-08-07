const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  PermissionFlagsBits,
  time,
} = require("discord.js");
const { Types } = require("mongoose");

const strikeSchema = require("../../Schemas/strikeSchema");
const modSchema = require("../../Schemas/modSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setName("strike")
    .setDescription("strike a user or remove a strike")
    .addSubcommand((subCmd) =>
      subCmd
        .setName("add")
        .setDescription("strike a user")
        .addUserOption((option) => {
          return option
            .setName("user")
            .setDescription("The user to strike")
            .setRequired(true);
        })
        .addStringOption((option) => {
          return option
            .setName("reason")
            .setDescription("The reason for the strike")
            .setRequired(true)
            .setMaxLength(500);
        })
    )
    .addSubcommand((subCmd) =>
      subCmd
        .setName("remove")
        .setDescription("Remove a strike from a user")
        .addStringOption((option) => {
          return option
            .setName("strike_id")
            .setDescription("The id of the strike to remove")
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
          const strikeTime = time();

          let totalStrikes = 0;
          try {
              const strikes = await strikeSchema.find({ guildId: guild.id, userId: user.id });
              totalStrikes = strikes.length + 1;
          } catch (err) {
              console.log(err);
          }

          const newSchema = new strikeSchema({
            _id: Types.ObjectId(),
            guildId: guild.id,
            userId: user.id,
            strikeReason: reason,
            moderator: member.user.id,
            strikeDate: strikeTime,
            strikeType: type,
            totalStrikes: totalStrikes,
          });

          newSchema.save().catch((err) => console.log(err));

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
              .setTitle("User striked!")
              .setDescription(`<@${user.id}> has been striked for \`${reason}\`!`)
              .setColor("FF0000"),
            ],
            ephemeral: true,
          });

          const modData = await client.channels.cache.get('1126662869476458646');
          const data = await strikeSchema.findOne({
            guildId: guild.id,
            userId: user.id,
          });

          if (modData) {
            await modData.send({
              embeds: [
                new EmbedBuilder().setTitle(":warning: Strike issued :warning:").addFields(
                  {
                    name: "Staff:",
                    value: `<@${user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Strike issued by:",
                    value: `<@${member.user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Date of strike:",
                    value: `${strikeTime}`,
                    inline: true,
                  },
                  {
                    name: "Strike ID:",
                    value: `\`${data._id}\``,
                    inline: true,
                  },
                  {
                    name: "Total strikes:",
                    value: `\`${totalStrikes}\``,
                    inline: true,
                  },
                  {
                    name: "Reason for strike:",
                    value: `\`\`\`${reason}\`\`\``,
                  }
                ),
              ],
            });
          }

          const modData2 = await client.channels.cache.get('1126662116091371521');

          if (modData2) {
            await modData2.send({
              embeds: [
                new EmbedBuilder().setTitle(":warning: Strike issued :warning:").addFields(
                  {
                    name: "Staff:",
                    value: `<@${user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Strike issued by:",
                    value: `<@${member.user.id}>`,
                    inline: true,
                  },
                  {
                    name: "Date of strike:",
                    value: `${strikeTime}`,
                    inline: true,
                  },
                  {
                    name: "Strike ID:",
                    value: `\`${data._id}\``,
                    inline: true,
                  },
                  {
                    name: "Total strikes:",
                    value: `\`${totalStrikes}\``,
                    inline: true,
                  },
                  {
                    name: "Reason for strike:",
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
                  .setTitle(`:warning:Staff strike recieved :warning:`)
                  .addFields(
                    {
                      name: "Strike issued by:",
                      value: `<@${member.user.id}>`,
                      inline: true,
                    },
                    {
                      name: "Date of strike:",
                      value: `${strikeTime}`,
                      inline: true,
                    },
                    {
                      name: "Reason for strike:",
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
                    .setColor("FF0000"),
                ],
              });
            });
        }
        break;

      case "remove": {
        const strikeId = interaction.options.getString("strike_id");

        const data = await strikeSchema.findById(strikeId);

        const err = new EmbedBuilder().setDescription(
          `No strike Id watching \`${strikeId}\` was found!`
        );

        if (!data) return await interaction.reply({ embeds: [err] });

        data.delete();

        const embed = new EmbedBuilder()
          .setTitle("Remove strike")
          .setDescription(
            `Successfully removed the strike with the ID matching ${strikeId}`
          );
        return await interaction.reply({ embeds: [embed] });
      }
    }
  },
};
