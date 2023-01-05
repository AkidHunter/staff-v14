const Discord = require('discord.js')

module.exports = {
    data: new Discord.SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a message as the bot')
        .addStringOption(option => option.setName('message').setDescription('Message to send as the bot').setRequired(true)),

    execute(interaction) {
        interaction.channel.send(interaction.options.getString('message').replaceAll('\\n', '\n'));
        interaction.reply({ content: 'Message sent!', ephemeral: true });
    }
}