const {
    EmbedBuilder,
    Client,
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder
  } = require("discord.js");
  const DB = require("../../schemas/suggestSetup");
  
  module.exports = {
    data: new SlashCommandBuilder()
        .setName("setsuggest")
        .setDescription("Set up the channel to where suggestions are sent.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("help")
                .setDescription("Display the help embed.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("config")
                .setDescription("Display the config for this guild.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("create")
                .setDescription("Create the setup required to use this suggestion system.") 
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("set-channel")
                .setDescription("Set the channel where suggestions will be sent.")
                .addChannelOption((options) =>
                    options
                        .setName("channel")
                        .setDescription("The channel where suggestions will be sent.")  
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("reset")
                .setDescription("Reset the suggestion system.") 
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("enable")
                .setDescription("Enable the suggestion system.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("disable")
                .setDescription("Disable the suggestion system.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("suggestion-managers")
                .setDescription("The roles which can accept/decline/delete suggestions.")
                .addStringOption((options) =>
                    options
                        .setName("option")
                        .setDescription("The option to use.")
                        .setRequired(true)
                )
                .addRoleOption((options) =>
                    options
                        .setName("role")
                        .setDescription("The role to add/remove.")
                        .setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allow-own-suggestion-delete")
                .setDescription("State whether members can delete their own suggestions.")
                .addBooleanOption((options) =>
                    options
                        .setName("true-or-false")
                        .setDescription("true/false")
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
      let suggestSetup = await DB.findOne({ GuildID: interaction.guild.id });
  
      if (
        !suggestSetup &&
        interaction.options.getSubcommand() != "create" &&
        interaction.options.getSubcommand() != "help"
      ) {
        return await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              
              .setDescription(
                `❌ This server has not setup the suggestion system. \n\n Please use \`/setSuggest create\`to begin the setup process.`
              ),
          ],
        });
      } else if (
        suggestSetup &&
        interaction.options.getSubcommand() == "create"
      ) {
        return await interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              
              .setDescription(
                `❌ This server has already setup the suggestion system.`
              ),
          ],
        });
      }
  
      const suggestionCommandHelp = new EmbedBuilder()
        
        .setTitle(`Suggestion system setup help`)
        .setDescription(
          `To begin using this suggestion system, start by using the command \`/setSuggest create\` to begin the setup process.` +
            `\n\n` +
            `You can then use the following commands to customise your system:` +
            `\n` +
            `\`•\` **/setSuggest help**: \`Displays this embed.\`` +
            `\n` +
            `\`•\` **/setSuggest config**: \`Displays the suggestion system config for this guild.\`` +
            `\n` +
            `\`•\` **/setSuggest create**: \`Creates the data required to use this system.\`` +
            `\n` +
            `\`•\` **/setSuggest set-channel [channel]**: \`Set the channel in which the suggestions will be sent.\`` +
            `\n` +
            `\`•\` **/setSuggest reset**: \`Reset the suggestion system for this guild.\`` +
            `\n` +
            `\`•\` **/setSuggest enable**: \`Enables the suggestion system.\`` +
            `\n` +
            `\`•\` **/setSuggest disable**: \`Disables the suggestion system.\`` +
            `\n` +
            `\`•\` **/setSuggest suggestion-managers [view/add/remove] [role]**: \`Allows you to add, remove and view the suggestion managers for this guild. Be aware that members with any of these roles can accept/decline suggestions and can delete other member's suggestions.\`` +
            `\n` +
            `\`•\` **/setSuggest allow-own-suggestion-delete**: \`Set whether members can delete their own suggestion or not.\``
        )
  
      const suggestionConfigHelp = new EmbedBuilder()
        
        .setTitle(`Suggestion system config help`)
        .setDescription(
          `\`•\` **Suggestions channel**: \`The channel in which suggestions are sent.\`` +
            `\n` +
            `\`•\` **Disabled**: \`Whether or not the suggestion system is disabled for this guild.\`` +
            `\n` +
            `\`•\` **Own suggestion delete**: \`Whether or not members can delete suggestions that they made\`` +
            `\n` +
            `\`•\` **Suggestion managers**: \`Members with any of these roles can accept/decline suggestions and can delete other member's suggestions.\``
        )
  
      switch (interaction.options.getSubcommand()) {
        case "help":
          await await interaction.reply({
            ephemeral: true,
            embeds: [suggestionCommandHelp],
          });
  
          break;
        case "create":
          await DB.create({
            GuildID: interaction.guild.id,
            ChannelID: "None",
            SuggestionManagers: [],
            AllowOwnSuggestionDelete: false,
            Disabled: true,
          }).then(async () => {
            await await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  
                  .setTitle(`Suggestion system`)
                  .setDescription(
                    `The suggestion system has successfully been created for ${interaction.guild.name}. \n\n To allow you to setup this system, the \`/suggest\` is currently disabled.`
                  )
              ],
            });
            await interaction.reply({
              ephemeral: true,
              embeds: [suggestionCommandHelp],
            });
          });
  
          break;
        case "set-channel":
          const channel = interaction.options.getChannel("channel");
  
          try {
            await channel
              .send({
                embeds: [
                  new EmbedBuilder()
                    
                    .setDescription(
                      `✅ This channel has been set as a suggestions channel.`
                    ),
                ],
              })
              .then(async () => {
                await DB.findOneAndUpdate(
                  { GuildID: interaction.guild.id },
                  { ChannelID: channel.id },
                  { new: true, upsert: true }
                );
                return await interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new EmbedBuilder()
                      
                      .setDescription(
                        `✅ ${channel} has successfully been set as the suggestions channel for ${interaction.guild.name}.`
                      ),
                  ],
                });
              });
          } catch (error) {
            if (error.message === "Missing Access") {
              return await interaction.reply({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    
                    .setDescription(
                      `❌ The bot does not have access to this channel.`
                    ),
                ],
              });
            } else {
              return await interaction.reply({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    
                    .setDescription(
                      `❌ An error occured. \n\n \`\`\`${error}\`\`\``
                    ),
                ],
              });
            }
          }
          break;
        case "config":
          const suggestionManagers =
            suggestSetup.SuggestionManagers.length <= 0 ||
            !suggestSetup.SuggestionManagers
              ? "None"
              : `<@&${suggestSetup.SuggestionManagers.join(">, <@&")}>`;
          const suggestionsChannel =
            suggestSetup.ChannelID === "None"
              ? "None"
              : `<#${suggestSetup.ChannelID}>`;
          const OwnSuggestionDelete = suggestSetup.AllowOwnSuggestionDelete
            ? "True"
            : "False";
          const suggestionSystemDisabled = suggestSetup.Disabled
            ? "Disabled"
            : "Enabled";
  
          const configEmbed = new EmbedBuilder()
            
            .setTitle(`Suggestion system config for ${interaction.guild.name}`)
            .addFields(
              {
                name: "Suggestions channel",
                value: `${suggestionsChannel}`,
                inline: true,
              },
              {
                name: "System Disabled/Enabled",
                value: `${suggestionSystemDisabled}`,
                inline: true,
              },
              {
                name: "Own suggestion delete",
                value: `${OwnSuggestionDelete}`,
                inline: true,
              },
              {
                name: "Suggestion managers",
                value: `${suggestionManagers}`,
                inline: false,
              }
            )
  
          await interaction.reply({
            ephemeral: true,
            embeds: [configEmbed],
          });
          break;
        case "reset":
          DB.deleteOne({ GuildID: interaction.guild.id }).then(async () => {
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  
                  .setDescription(
                    `✅ The suggestions channel has successfully been reset.`
                  ),
              ],
            });
          });
          break;
        case "enable":
          if (suggestSetup.Disabled == false)
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  
                  .setDescription(`❌ The suggestion system is already enabled.`),
              ],
            });
  
          await DB.findOneAndUpdate(
            { GuildID: interaction.guild.id },
            { Disabled: false }
          );
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                
                .setDescription(`✅ The suggestion system has been enabled.`),
            ],
          });
  
          break;
        case "disable":
          if (suggestSetup.Disabled == true)
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  
                  .setDescription(
                    `❌ The suggestion system is already disabled.`
                  ),
              ],
            });
  
          await DB.findOneAndUpdate(
            { GuildID: interaction.guild.id },
            { Disabled: true }
          );
          await interaction.reply({
            ephemeral: true,
            embeds: [
              new EmbedBuilder()
                
                .setDescription(`✅ The suggestion system has been disabled.`),
            ],
          });
  
          break;
        case "suggestion-managers":
          switch (interaction.options.getString("option")) {
            case "view":
              const suggestionManagers =
                suggestSetup.SuggestionManagers.length <= 0 ||
                !suggestSetup.SuggestionManagers
                  ? "None"
                  : `<@&${suggestSetup.SuggestionManagers.join(">, <@&")}>`;
              await interaction.reply({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    
                    .setTitle(
                      `Suggestion manangers for ${interaction.guild.name}`
                    )
                    .setDescription(
                      `Please note that these members can accept, decline and delete suggestions.\n\n${suggestionManagers}`
                    ),
                ],
              });
              break;
            case "add":
              let role = interaction.options.getRole("role");
              if (!role)
                return await interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new EmbedBuilder()
                      
                      .setDescription(`❌ You didn't provide a role.`),
                  ],
                });
  
              if (suggestSetup.SuggestionManagers.includes(role.id))
                return await interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new EmbedBuilder()
                      
                      .setDescription(
                        `❌ ${role} is already a suggestion manager.`
                      ),
                  ],
                });
  
              await suggestSetup.SuggestionManagers.push(role.id);
              await suggestSetup.save();
  
              await interaction.reply({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    
                    .setDescription(
                      `✅ ${role} has been added as a suggestion manager.`
                    ),
                ],
              });
  
              break;
            case "remove":
              let role2 = interaction.options.getRole("role");
              if (!role2)
                return await interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new EmbedBuilder()
                      
                      .setDescription(`❌ You didn't provide a role.`),
                  ],
                });
  
              if (!suggestSetup.SuggestionManagers.includes(role.id))
                return await interaction.reply({
                  ephemeral: true,
                  embeds: [
                    new EmbedBuilder()
                      
                      .setDescription(`❌ ${role} isn't a suggestion manager.`),
                  ],
                });
  
              await suggestSetup.SuggestionManagers.splice(
                suggestSetup.SuggestionManagers.indexOf(role.id, 1)
              );
              await suggestSetup.save();
  
              await interaction.reply({
                ephemeral: true,
                embeds: [
                  new EmbedBuilder()
                    
                    .setDescription(
                      `✅ ${role} has been removed as a suggestion manager.`
                    ),
                ],
              });
  
              break;
          }
          break;
        case "allow-own-suggestion-delete":
          const allowOwnSuggestionDelete =
            interaction.options.getBoolean("true-or-false");
  
          if (allowOwnSuggestionDelete) {
            await DB.findOneAndUpdate(
              { GuildID: interaction.guild.id },
              { AllowOwnSuggestionDelete: true }
            );
            return await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  
                  .setDescription(
                    `✅ Members can now delete their own suggestions.`
                  ),
              ],
            });
          } else {
            await DB.findOneAndUpdate(
              { GuildID: interaction.guild.id },
              { AllowOwnSuggestionDelete: false }
            );
            await interaction.reply({
              ephemeral: true,
              embeds: [
                new EmbedBuilder()
                  
                  .setDescription(
                    `✅ Members can now not delete their own suggestions.`
                  ),
              ],
            });
          }
          break;
      }
    },
  };
  