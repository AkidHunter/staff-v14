const { Console } = require("console");
const {
  EmbedBuilder,
  Message,
  CommandInteraction,
  Client,
  Permissions,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
} = require("discord.js");
const suggestDB = require("../../schemas/suggest");
const suggestSetupDB = require("../../schemas/suggestSetup");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest-moderate")
    .setDescription("Accept or decline a suggestion.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accept")
        .setDescription("Accept a suggestion.")
        .addStringOption((options) =>
          options
            .setName("message-id")
            .setDescription(
              "The message id of the suggestion you want to accept."
            )
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("The reason why this suggestion was accepted.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("decline")
        .setDescription("Decline a suggestion.")
        .addStringOption((options) =>
          options
            .setName("message-id")
            .setDescription(
              "The message id of the suggestion you want to decline."
            )
            .setRequired(true)
        )
        .addStringOption((options) =>
          options
            .setName("reason")
            .setDescription("The reason why this suggestion was declined.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a suggestion.")
        .addStringOption((options) =>
          options
            .setName("message-id")
            .setDescription(
              "The message id of the suggestion you want to delete."
            )
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {Client} client
   * @param {CommandInteraction} interaction
   * @param {CommandInteractionOptionResolver} options
   */
  async execute(interaction, client) {
    const { options } = interaction;
    const messageId = interaction.options.getString("message-id");
    const reason = interaction.options.getString("reason");

    if (reason) {
      if (reason.length > 1024)
        return await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder().setDescription(
              `❌ Your reason can't be longer than 1024 characters.`
            ),
          ],
        });
    }

    const suggestSetup = await suggestSetupDB.findOne({
      GuildID: interaction.guildId,
    });
    let suggestionsChannel;

    if (!suggestSetup) {
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
        suggestSetup.ChannelID
      );
    }

    if (interaction.options.getSubcommand() != "delete") {
      if (
        suggestSetup.SuggestionManagers.length <= 0 ||
        !suggestSetup.SuggestionManagers
      ) {
        if (!interaction.member.permissions.has("Administrator"))
          return await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder().setDescription(
                `❌ You are neither a suggestion manager nor an admin`
              ),
            ],
          });
      } else {
        if (!interaction.member.permissions.has("Administrator")) {
          for (let i = 0; i < suggestSetup.SuggestionManagers.length; i++) {
            if (
              !interaction.member.roles.cache.has(
                suggestSetup.SuggestionManagers[i]
              )
            )
              continue;

            if (
              interaction.member.roles.cache.has(
                suggestSetup.SuggestionManagers[i]
              )
            )
              suggestionManager = true;
          }

          if (!suggestionManager)
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder().setDescription(
                  `❌ You are not a suggestion manager.`
                ),
              ],
            });
        }
      }
    }

    const suggestion = await suggestDB.findOne({
      GuildID: interaction.guild.id,
      MessageID: messageId,
    });

    if (!suggestion)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(
            `❌ This suggestion was not found in the database.`
          ),
        ],
      });

    const message = await suggestionsChannel.messages.fetch(messageId);

    if (!message)
      return await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder().setDescription(`❌ This message was not found.`),
        ],
      });

    const Embed = message.embeds[0];
    if (!Embed) return;

    switch (interaction.options.getSubcommand()) {
      case "accept":
        Embed.fields[1] = {
          name: "Status",
          value: `Accepted by ${interaction.user.username}`,
          inline: true,
        };
        Embed.fields[2] = { name: "Reason", value: `${reason}`, inline: true };
        message.edit({
          embeds: [Embed],
          content: `<@${suggestion.MemberID}>`,
          components: [],
        });

        if (suggestion.DM) {
          const member = client.users.cache.get(suggestion.MemberID);
          member
            .send({
              embeds: [
                new EmbedBuilder()

                  .setTitle("Suggestion 💡")
                  .setDescription(`✅ Your suggestion was accepted.`)
                  .addFields(
                    {
                      name: "Suggestion",
                      value: `[link](${message.url})`,
                      inline: true,
                    },
                    {
                      name: "Guild",
                      value: `${interaction.guild.name}`,
                      inline: true,
                    },
                    { name: "Reason", value: `${reason}`, inline: true }
                  ),
              ],
            })
            .catch(() => null);
        }
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder().setDescription(
              `✅ [Suggestion](${message.url}) was accepted.`
            ),
          ],
        });
        break;

      case "decline":
        Embed.fields[1] = {
          name: "Status",
          value: `Declined by ${interaction.user.username}`,
          inline: true,
        };
        Embed.fields[2] = { name: "Reason", value: `${reason}`, inline: true };
        message.edit({
          embeds: [Embed],
          content: `<@${suggestion.MemberID}>`,
          components: [],
        });

        if (suggestion.DM) {
          const member = client.users.cache.get(suggestion.MemberID);
          member
            .send({
              embeds: [
                new EmbedBuilder()

                  .setTitle("Suggestion 💡")
                  .setDescription(`❌ Your suggestion was declined.`)
                  .addFields(
                    {
                      name: "Suggestion",
                      value: `[link](${message.url})`,
                      inline: true,
                    },
                    {
                      name: "Guild",
                      value: `${interaction.guild.name}`,
                      inline: true,
                    },
                    { name: "Reason", value: `${reason}`, inline: true }
                  ),
              ],
            })
            .catch(() => null);
        }
        await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder().setDescription(
              `✅ [Suggestion](${message.url}) declined.`
            ),
          ],
        });
        break;

      case "delete":
        if (
          !suggestSetup.AllowOwnSuggestionDelete &&
          !suggestionManager &&
          !interaction.member.permissions.has("Administrator")
        ) {
          return await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder().setDescription(
                `❌ You cannot delete this [suggestion](${message.url})`
              ),
            ],
          });
        } else if (
          suggestionManager ||
          interaction.member.permissions.has("Administrator")
        ) {
          await message.delete();
          return await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder().setDescription(
                `✅ This [suggestion](${message.url})  was deleted.`
              ),
            ],
          });
        } else if (suggestSetup.AllowOwnSuggestionDelete) {
          if (suggestion.MemberID === interaction.member.id) {
            await message.delete();
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder().setDescription(
                  `✅ Your [suggestion](${message.url}) was deleted.`
                ),
              ],
            });
          } else {
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder().setDescription(
                  `❌ This isn't your ${message.url}.`
                ),
              ],
            });
          }
        }
        break;
    }
  },
};
