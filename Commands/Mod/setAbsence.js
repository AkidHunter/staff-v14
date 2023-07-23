const { EmbedBuilder, SlashCommandBuilder,  } = require("discord.js");
const DB = require("../../schemas/absenceSetup");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("absencesetup")
        .setDescription("Set up the channel to where absence requests are sent.")
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
                .setDescription("Create the setup required to use this absence system.")
        )
        .addSubcommand((subcommand) =>  
            subcommand
                .setName("set-channel")
                .setDescription("Set the channel where absence requests will be sent.")
                .addChannelOption((options) =>
                    options
                        .setName("channel")
                        .setDescription("The channel where absence requests will be sent.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("reset")
                .setDescription("Reset the absence system.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("enable")
                .setDescription("Enable the absence system.")
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("disable")
                .setDescription("Disable the absence system.")  
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("absence-managers")
                .setDescription("The roles which can accept/decline/delete absence requests.")
                .addRoleOption((options) =>
                    options
                        .setName("role")
                        .setDescription("The role which can accept/decline/delete absence requests.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("absence-creators")
                .setDescription("The roles which can create absence requests.")
                .addRoleOption((options) =>
                    options
                        .setName("role")
                        .setDescription("The role which can create absence requests.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("absence-creators-remove")
                .setDescription("Remove a role from the list of roles which can create absence requests.")
                .addRoleOption((options) =>
                    options
                        .setName("role")
                        .setDescription("The role which can create absence requests.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("allow-own-absence-delete")
                .setDescription("State whether members can delete their own absence requests.")
                .addBooleanOption((options) =>
                    options
                        .setName("state")
                        .setDescription("true/false")
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        var suggestSetup = await DB.findOne({ GuildID: interaction.guild.id })

        if (!suggestSetup && interaction.options.getSubcommand() != "create" && interaction.options.getSubcommand() != "help") {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ This server has not setup the absence system. \n\n Please use \`/absenceSetup create\`to begin the setup process.`)] })
        } else if (suggestSetup && interaction.options.getSubcommand() == "create") {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ This server has already setup the absence system.`)] })
        }

        const suggestionCommandHelp = new EmbedBuilder()
            .setColor("00FFFF")
            .setTitle(`Absence system setup help`)
            .setDescription(`To begin using this absence system, start by using the command \`/setAbsence create\` to begin the setup process.` + `\n\n` +
                `You can then use the following commands to customise your system:` + `\n` +
                `\`•\` **/absenceSetup help**: \`Displays this embed.\`` + `\n` +
                `\`•\` **/absenceSetup config**: \`Displays the abcense system config for this guild.\`` + `\n` +
                `\`•\` **/absenceSetup create**: \`Creates the data required to use this system.\`` + `\n` +
                `\`•\` **/absenceSetup set-channel [channel]**: \`Set the channel in which the abcenses will be sent.\`` + `\n` +
                `\`•\` **/absenceSetup reset**: \`Reset the abcense system for this guild.\`` + `\n` +
                `\`•\` **/absenceSetup enable**: \`Enables the abcense system.\`` + `\n` +
                `\`•\` **/absenceSetup disable**: \`Disables the abcense system.\`` + `\n` +
                `\`•\` **/absenceSetup abcense-managers [view/add/remove] [role]**: \`Allows you to add, remove and view the abcense managers for this guild. Be aware that members with any of these roles can accept/decline abcenses and can delete other member's abcenses.\`` + `\n` +
                `\`•\` **/absenceSetup allow-own-abcense-delete**: \`Set whether members can delete their own abcense or not.\``
            )



        const suggestionConfigHelp = new EmbedBuilder()
            .setColor("00FFFF")
            .setTitle(`Absence system config help`)
            .setDescription(
                `\`•\` **Absence channel**: \`The channel in which absence requests are sent.\`` + `\n` +
                `\`•\` **Disabled**: \`Whether or not the absence system is disabled for this guild.\`` + `\n` +
                `\`•\` **Own absence delete**: \`Whether or not members can delete absence requests that they made\`` + `\n` +
                `\`•\` **Absence managers**: \`Members with any of these roles can accept/decline absence requests and can delete other member's absence requests.\``
            )


        switch (interaction.options.getSubcommand()) {
            case "help":
                await interaction.reply({ embeds: [suggestionCommandHelp] })
                    //    await interaction.followUp({embeds: [suggestionConfigHelp]})

                break;
            case "create":
                await DB.create({ GuildID: interaction.guild.id, ChannelID: "None", SuggestionManagers: [], AllowOwnSuggestionDelete: false, Disabled: true }).then(async() => {
                    await interaction.reply({
                        embeds: [new EmbedBuilder().setColor("00FFFF").setTitle(`Suggestion system`).setDescription(`The absence system has successfully been created for ${interaction.guild.name}. \n\n To allow you to setup this system, the \`/absence\` is currently disabled.`)]
                    })
                    await interaction.followUp({ embeds: [suggestionCommandHelp] })
                })

                break;
            case "set-channel":
                const channel = interaction.options.getChannel("channel");

                try {
                    await channel.send({
                        embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ This channel has been set as an absence channel.`)]
                    }).then(async() => {
                        await DB.findOneAndUpdate({ GuildID: interaction.guild.id }, { ChannelID: channel.id }, { new: true, upsert: true })
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ ${channel} has successfully been set as the absence channel for ${interaction.guild.name}.`)] })
                    })
                } catch (error) {
                    if (error.message === "Missing Access") {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ The bot does not have access to this channel.`)] })
                    } else {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ An error occured. \n\n \`\`\`${error}\`\`\``)] })
                    }
                }
                break;
            case "config":
                const suggestionManagers = suggestSetup.SuggestionManagers.length <= 0 || !suggestSetup.SuggestionManagers ? "None" : `<@&${suggestSetup.SuggestionManagers.join(">, <@&")}>`
                const suggestionsChannel = suggestSetup.ChannelID === "None" ? "None" : `<#${suggestSetup.ChannelID}>`
                const OwnSuggestionDelete = suggestSetup.AllowOwnSuggestionDelete ? "True" : "False"
                const suggestionSystemDisabled = suggestSetup.Disabled ? "Disabled" : "Enabled"

                const configEmbed = new EmbedBuilder()
                    .setColor("00FFFF")
                    .setTitle(`Absence system config for ${interaction.guild.name}`)
                    .addFields({ name: "Abcense channel", value: `${suggestionsChannel}`, inline: true }, { name: "System Disabled/Enabled", value: `${suggestionSystemDisabled}`, inline: true }, { name: "Own suggestion delete", value: `${OwnSuggestionDelete}`, inline: true }, { name: "Suggestion managers", value: `${suggestionManagers}`, inline: false }, )

                interaction.reply({ embeds: [configEmbed] })
                break;
            case "reset":
                DB.deleteOne({ GuildID: interaction.guild.id })
                    .then(() => {
                        return interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ The absence channel has successfully been reset.`)] })
                    })
                break;
            case "enable":
                if (suggestSetup.Disabled == false)
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ The absence system is already enabled.`)] })

                await DB.findOneAndUpdate({ GuildID: interaction.guild.id }, { Disabled: false })
                interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ The absence system has been enabled.`)] })

                break;
            case "disable":
                if (suggestSetup.Disabled == true)
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ The absence system is already disabled.`)] })

                await DB.findOneAndUpdate({ GuildID: interaction.guild.id }, { Disabled: true })
                interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ The absence system has been disabled.`)] })

                break;
            case "absence-managers":
                switch (interaction.options.getRole("role")) {
                    case "view":
                        const suggestionManagers = suggestSetup.SuggestionManagers.length <= 0 || !suggestSetup.SuggestionManagers ? "None" : `<@&${suggestSetup.SuggestionManagers.join(">, <@&")}>`
                        interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setTitle(`Absence manangers for ${interaction.guild.name}`).setDescription(`Please note that these members can accept, decline and delete absence requests.\n\n${suggestionManagers}`)] })
                        break;
                    case "add":
                        var role = interaction.options.getRole("role")
                        if (!role)
                            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ You didn't provide a role.`)] })

                        if (suggestSetup.SuggestionManagers.includes(role.id))
                            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ ${role} is already a absence manager.`)] })

                        await suggestSetup.SuggestionManagers.push(role.id)
                        await suggestSetup.save()

                        interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ ${role} has been added as a absence manager.`)] })

                        break;
                    case "remove":
                        var role = interaction.options.getRole("role")
                        if (!role)
                            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ You didn't provide a role.`)] })

                        if (!suggestSetup.SuggestionManagers.includes(role.id))
                            return interaction.reply({ embeds: [new EmbedBuilder().setColor("FF0000").setDescription(`❌ ${role} isn't a absence manager.`)] })

                        await suggestSetup.SuggestionManagers.splice(suggestSetup.SuggestionManagers.indexOf(role.id, 1))
                        await suggestSetup.save()

                        interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ ${role} has been removed as a absence manager.`)] })

                        break;
                }
                break;
            case "allow-own-absence-delete":
                const allowOwnSuggestionDelete = interaction.options.getBoolean("true-or-false");

                if (allowOwnSuggestionDelete) {
                    await DB.findOneAndUpdate({ GuildID: interaction.guild.id }, { AllowOwnSuggestionDelete: true })
                    return interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ Members can now delete their own absence requests.`)] })
                } else {
                    await DB.findOneAndUpdate({ GuildID: interaction.guild.id }, { AllowOwnSuggestionDelete: false })
                    interaction.reply({ embeds: [new EmbedBuilder().setColor("00FFFF").setDescription(`✅ Members can now not delete their own absence requests.`)] })
                }
                break;
        }
    }
}