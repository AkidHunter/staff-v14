const { Console } = require("console");
const { MessageEmbed, Message, CommandInteraction, Client, Permissions } = require("discord.js");
const suggestDB = require("../../schema/absence");
const suggestSetupDB = require("../../schema/absenceSetup");

module.exports = {
    name: 'absenceactions',
    description: "Accept or decline an absence request.",
    permissions: ['MANAGE_WEBHOOKS'],
    options: [{
            name: "accept",
            description: "Accept an absence request.",
            type: "SUB_COMMAND",
            options: [
                { name: "message-id", description: "The message id of the absence reqest you want to accept.", type: "STRING", required: true },
                { name: "reason", description: "The reason why this absence request was accepted.", type: "STRING", required: true }
            ]
        },
        {
            name: "decline",
            description: "Decline an absence request.",
            type: "SUB_COMMAND",
            options: [
                { name: "message-id", description: "The message id of the absence request you want to decline.", type: "STRING", required: true },
                { name: "reason", description: "The reason why this absence request was declined.", type: "STRING", required: true }
            ]
        },
        {
            name: "delete",
            description: "Delete an absence request.",
            type: "SUB_COMMAND",
            options: [
                { name: "message-id", description: "The message id of the absence request you want to delete.", type: "STRING", required: true },
            ]
        },
    ],

    async execute(interaction, client) {
        const messageId = interaction.options.getString("message-id");
        const reason = interaction.options.getString("reason");

        if (reason) {
            if (reason.length > 1024)
                return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ Your reason can't be longer than 1024 characters.`)], ephemeral: true })
        }

        const suggestSetup = await suggestSetupDB.findOne({ GuildID: interaction.guildId });
        var suggestionsChannel;

        if (!suggestSetup) {
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ This server has not setup the absence system.`)] })
        } else {
            suggestionsChannel = interaction.guild.channels.cache.get(suggestSetup.ChannelID)
        }


        if (interaction.options.getSubcommand() != "delete") {
            if (suggestSetup.SuggestionManagers.length <= 0 || !suggestSetup.SuggestionManagers) {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
                    return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ You are neither an absence manager nor an admin`)], ephemeral: true });
            } else {
                if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {


                    for (var i = 0; i < suggestSetup.SuggestionManagers.length; i++) {
                        if (!interaction.member.roles.cache.has(suggestSetup.SuggestionManagers[i]))
                            continue;

                        if (interaction.member.roles.cache.has(suggestSetup.SuggestionManagers[i]))
                            var suggestionManager = true;
                    }
                    if (!suggestionManager)
                        return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ You are not an absence manager.`)], ephemeral: true });
                }
            }
        }

        const suggestion = await suggestDB.findOne({ GuildID: interaction.guild.id, MessageID: messageId });

        if (!suggestion)
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ This absence request was not found in the database.`)], ephemeral: true })

        const message = await suggestionsChannel.messages.fetch(messageId)

        if (!message)
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ This absence request was not found.`)], ephemeral: true })

        const Embed = message.embeds[0];
        if (!Embed) return;

        switch (interaction.options.getSubcommand()) {
            case "accept":
                Embed.fields[1] = { name: "Status", value: `Accepted by ${interaction.user.username}`, inline: true };
                Embed.fields[2] = { name: "Reason", value: `${reason}`, inline: true }
                message.edit({ embeds: [Embed.setColor("GREEN")], content: `<@${suggestion.MemberID}>`, components: [] });

                if (suggestion.DM) {
                    const member = client.users.cache.get(suggestion.MemberID);
                    member.send({ embeds: [new MessageEmbed().setColor("GREEN").setTitle("Absence Request 💡").setDescription(`✅ Your absence request was accepted.`).addFields({ name: "Guild", value: `${interaction.guild.name}`, inline: true }, { name: "Reason", value: `${reason}`, inline: true }, { name: "Staff", value: `${interaction.user.username}`, inline: true  })] }).catch(() => null)
                }
                interaction.reply({ embeds: [new MessageEmbed().setColor("AQUA").setDescription(`✅ [Absence](${message.url}) was accepted.`)], ephemeral: true })
                break;

            case "decline":
                Embed.fields[1] = { name: "Status", value: `Declined by ${interaction.user.username}`, inline: true };
                Embed.fields[2] = { name: "Reason", value: `${reason}`, inline: true }
                message.edit({ embeds: [Embed.setColor("RED")], content: `<@${suggestion.MemberID}>`, components: [] });

                if (suggestion.DM) {
                    const member = client.users.cache.get(suggestion.MemberID);
                    member.send({ embeds: [new MessageEmbed().setColor("RED").setTitle("Absence Request 💡").setDescription(`❌ Your absence request was declined.`).addFields({ name: "Guild", value: `${interaction.guild.name}`, inline: true }, { name: "Reason", value: `${reason}`, inline: true }, { name: "Staff", value: `${interaction.user.username}`, inline: true  })] }).catch(() => null)
                }
                interaction.reply({ embeds: [new MessageEmbed().setColor("AQUA").setDescription(`✅ [Absence](${message.url}) declined.`)], ephemeral: true })
                break;

            case "delete":

                if (!suggestSetup.AllowOwnSuggestionDelete && !suggestionManager && !interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ You cannot delete this [absence](${message.url})`)] })
                } else if (suggestionManager || interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                    await message.delete()
                    return interaction.reply({ embeds: [new MessageEmbed().setColor("AQUA").setDescription(`✅ This [absence](${message.url})  was deleted.`)] })
                } else if (suggestSetup.AllowOwnSuggestionDelete) {
                    if (suggestion.MemberID === interaction.member.id) {
                        await message.delete()
                        return interaction.reply({ embeds: [new MessageEmbed().setColor("AQUA").setDescription(`✅ Your [absence](${message.url}) was deleted.`)] })
                    } else {
                        return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ This isn't your ${message.url}.`)] })
                    }

                }
                break;
        }
    },
};