const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leave")
        .setDescription("Instructs the bot to leave the server."),
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     */
    async execute(interaction) {
        // Array of trusted user IDs. You can add multiple IDs here.
        const trustedUsers = ["223504240935436288"];  // Replace 'YOUR_USER_ID' with your Discord User ID

        if (!trustedUsers.includes(interaction.user.id)) {
            return await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true
            });
        }

        // Reply before leaving
        await interaction.reply("Leaving the server as requested. Goodbye!");
        
        // Fetch the guild (server) and then leave it
        const guild = interaction.guild;
        if (guild) {
            await guild.leave();
        }
    }
};
