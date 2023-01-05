const { CommandInteraction, MessageEmbed, SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Create a custom embed.")
        .addStringOption((options) => 
          options 
            .setName("title")
            .setDescription("Provide a title for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options 
            .setName("url")
            .setDescription("Provide a url for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options 
            .setName("author")
            .setDescription("Provide an author for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options 
            .setName("description")
            .setDescription("Provide a description for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options
            .setName("thumbnail")
            .setDescription("Provide a thumbnail for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options 
            .setName("image")
            .setDescription("Provide an image for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options 
            .setName("footer")
            .setDescription("Provide a footer for the embed.")
            .setRequired(false)
        )
        .addStringOption((options) => 
           options 
            .setName("timestamp")
            .setDescription("Provide a timestamp for the embed.")
            .setRequired(false)
        ),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {

    var CUSTOM_EMBED = new EmbedBuilder() 
        if (interaction.options.getString("title")) CUSTOM_EMBED.setTitle(interaction.options.getString("title"))
        if (interaction.options.getString("description")) CUSTOM_EMBED.setDescription(interaction.options.getString("description").replaceAll('\\n', '\n'))
        if (interaction.options.getString("colour")) CUSTOM_EMBED.setColor(interaction.options.getString("colour"))   
        if (interaction.options.getString("author")) CUSTOM_EMBED.setAuthor(interaction.options.getString("author"))
        if (interaction.options.getString("url")) CUSTOM_EMBED.setURL(interaction.options.getString("url"))
        if (interaction.options.getString("thumbnail")) CUSTOM_EMBED.setThumbnail(interaction.options.getString("thumbnail"))
        if (interaction.options.getString("image")) CUSTOM_EMBED.setImage(interaction.options.getString("image"))
        if (interaction.options.getString("footer")) CUSTOM_EMBED.setFooter(interaction.options.getString("footer"))
        if (interaction.options.getString("timestamp")) CUSTOM_EMBED.setTimestamp(interaction.options.getString("timestamp"))
 
        interaction.channel.send({ embeds: [CUSTOM_EMBED] });
        interaction.reply({ content: 'Message sent!', ephemeral: true });
    }
  }
