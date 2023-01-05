const { CommandInteraction, MessageEmbed } = require("discord.js");
const suggestDB = require("../../schema/absence");
const suggestSetupDB = require("../../schema/absenceSetup");
module.exports = {
    name: 'absence',
    description: "Create an absence request.",
    options: [{
            name: "type",
            description: "Select a type.",
            required: true,
            type: "STRING",
            choices: [{
                    name: "Sick",
                    value: "Sick",
                },
                {
                    name: "Traveling",
                    value: "Traveling",
                },
                {
                    name: "Other",
                    value: "Other",
                },
            ],
        },
        {
            name: "explanation",
            description: "Describe your absence request.",
            type: "STRING",
            required: true,
        },
        {
            name: "length",
            description: "Describe your absence length.",
            type: "STRING",
            required: true,
        },
        {
            name: "dm",
            description: "Set whether the bot will DM you, once your absence request has been declined or accepted.",
            type: "BOOLEAN",
            required: true,
        }
    ],
    /**
     * @param {CommandInteraction} interaction 
     */
     async execute(interaction, client) {
        
        const { options, guildId, member, user } = interaction;

        const type = options.getString("type");
        const explanation = options.getString("explanation");
        const length = options.getString("length")
        const DM = options.getBoolean("dm")

        const absenceSetup = await suggestSetupDB.findOne({ GuildID: guildId });
        var absenceChannel;

        if (!absenceSetup) {
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ This server has not setup the absent system.`)] })
        } else {
            absenceChannel = interaction.guild.channels.cache.get(absenceSetup.ChannelID)
        }

        if (absenceSetup.Disabled)
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ Absents are currently disabled.`)] })

        if (absenceSetup.ChannelID === "None")
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ The absent channel hasn't been set.`)] })


        const Embed = new MessageEmbed()
            .setColor("ORANGE")
            .setDescription(`**Absence Request:**\n ${interaction.user.tag}`)
            .addFields({ name: "Type", value: type, inline: true }, { name: "Status", value: "🕐 Pending", inline: true }, { name: "Length", value: length, inline: true }, { name: "Explanation", value: explanation, inline: true }, )

        try {
            const M = await absenceChannel.send({ embeds: [Embed]});


            await suggestDB.create({
                GuildID: guildId,
                MessageID: M.id,
                Details: [{
                    MemberID: member.id,
                    Type: type,
                    Explanation: explanation,
                    Length: length,
                }],
                MemberID: member.id,
                DM: DM,
                UpvotesMembers: [],
                DownvotesMembers: [],
                InUse: false,
            })
            interaction.reply({ embeds: [new MessageEmbed().setColor("ORANGE").setDescription(`✅ Hey ${interaction.user.tag},Your absence was successfully created and sent to be reviewed by an Admin+`)], ephemeral: true})
        } catch (err) {
            console.log(err);
            return interaction.reply({ embeds: [new MessageEmbed().setColor("RED").setDescription(`❌ An error occured.`)] })
        }
    }
}