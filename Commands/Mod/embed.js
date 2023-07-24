const { CommandInteraction, MessageEmbed, SlashCommandBuilder, EmbedBuilder, Color } = require("discord.js");
const colorList = require('color-name-list');

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
         .setName("colour")
         .setDescription("Provide a colour for the embed.")
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

    // const colors = {
    //     'default': 0x000000,
    //     'white': 0xFFFFFF,
    //     'aqua': 0x1ABC9C,
    //     'green': 0x2ECC71,
    //     'blue': 0x3498DB,
    //     'purple': 0x9B59B6,
    //     'lime': 0x1F8B4C,
    //     'yellow': 0xFFFF00,
    //     'orange': 0xE67E22,
    //     'red': 0xE74C3C,
    //     'grey': 0x95A5A6,
    //     'navy': 0x34495E,
    //     'darkaqua': 0x11806A,
    //     'darkgreen': 0x1F8B4C,
    //     'darkblue': 0x206694,
    //     'darkpurple': 0x71368A,
    //     'darkviolet': 0xAD1457,
    //     'darkorange': 0xC27C0E,
    //     'darkred': 0x992D22,
    //     'darkgrey': 0x979C9F,
    //     'darkergrey': 0x7F8C8D,
    //     'lightgrey': 0xBCC0C0,
    //     'darknavy': 0x2C3E50,
    //     'blurple': 0x7289DA,
    //     'grayple': 0x99AAB5,
    //     'darkbutnotblack': 0x2C2F33,
    //     'notquiteblack': 0x23272A,
    //     'random': Math.floor(Math.random() * (0xFFFFFF + 1)),
    // };

    let colorName = interaction.options.getString("colour");
    let color = colorList.find(c => c.name.toLowerCase() === colorName.toLowerCase());

    var CUSTOM_EMBED = new EmbedBuilder() 
        if (interaction.options.getString("title")) CUSTOM_EMBED.setTitle(interaction.options.getString("title"))
        if (interaction.options.getString("description")) CUSTOM_EMBED.setDescription(interaction.options.getString("description").replaceAll('\\n', '\n'))
        if (color) {
            CUSTOM_EMBED.setColor(color.hex);
          } else {
            // handle invalid color name, e.g. default to black
            CUSTOM_EMBED.setColor(0x000000);
          }
        if (interaction.options.getString("author")) CUSTOM_EMBED.setAuthor(interaction.options.getString("author"))
        if (interaction.options.getString("url")) CUSTOM_EMBED.setURL(interaction.options.getString("url"))
        if (interaction.options.getString("thumbnail")) CUSTOM_EMBED.setThumbnail(interaction.options.getString("thumbnail"))
        if (interaction.options.getString("image")) CUSTOM_EMBED.setImage(interaction.options.getString("image"))
        if (interaction.options.getString("footer")) CUSTOM_EMBED.setFooter({text: interaction.options.getString("footer")})
        if (interaction.options.getString("timestamp")) CUSTOM_EMBED.setTimestamp(interaction.options.getString("timestamp"))
 
        interaction.channel.send({ embeds: [CUSTOM_EMBED] });
        interaction.reply({ content: 'Message sent!', ephemeral: true });
    }
  }
