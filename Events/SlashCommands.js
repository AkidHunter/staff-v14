const { ChatInputCommandInteraction, InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    if (
      interaction.type != InteractionType.ApplicationCommand &&
      interaction.type != InteractionType.MessageComponent
    )
      return;
    //

    const command = client.commands.get(interaction.commandName);

    if (interaction.type == InteractionType.ApplicationCommand) {
      if (!command)
        return await interaction.reply({
          content: "This command is outdated!",
          ephemeral: true,
        });
      if (command.developer && interaction.user.id !== "223504240935436288")
        return await interaction.reply({
          content: "This command is only available to the developer.",
          ephemeral: true,
        });

      command.execute(interaction, client);
    }
  },
};
