const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Send a poll as the bot')
        .addStringOption(option => option.setName('message')
        .setDescription('Message to send as the bot')
        .setRequired(true)
        ),

    async execute(interaction) {
        message = await interaction.channel.send(interaction.options.getString('message').replaceAll('\\n', '\n'));
        await message.react('✅');
        await message.react('❌')	;
        interaction.reply({ content: 'Poll message sent!', ephemeral: true });
    }
}