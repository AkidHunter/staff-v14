const {
    CommandInteraction,
    Client,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    color,
  } = require("discord.js");
  
  module.exports = {
    data: new SlashCommandBuilder()
        .setName("raffle")
        .setDescription("Create a raffle!")
        .addStringOption((options) =>
            options
                .setName("roles")
                .setDescription("The roles for this raffle. Seperate each role with a space!")
                .setRequired(true)
        )
        .addIntegerOption((options) =>
            options
                .setName("winners")
                .setDescription("The amount of winners for this raffle.")
                .setRequired(true)
        ),
    /**
     *
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {CommandInteractionOptionResolver} options
     */
    async execute(interaction, client) {
      const { options } = interaction;
      const roles = options.getString("roles").split(" ");
      const count = options.getInteger("winners");
  
      const members = [];
      const winners = [];
  
      roles.forEach((r) => {
        const id = r.replace(/\D/g, "");
        const role = interaction.guild.roles.cache.get(id);
        if (role) {
          const roleMembers = role.members;
          const people = roleMembers.map((m) => m.user.toString());
          people.forEach((person) => members.push(person));
        }
      });
  
      if (members.filter((m) => m === undefined).length > 0)
        return await interaction.reply({
     ephemeral: true,
          content: "Invalid role provided!!",
          
        });
  
      for (let i = 0; i < count; i++) {
        const random = Math.floor(Math.random() * members.length);
        const winner = members[random];
        winners.push(winner);
      }
  
      return await interaction.reply({
     ephemeral: true,
        content: [...new Set(winners)].join(" "),
        embeds: [
          {
            title: "You won the raffle!! 🎁",
          },
        ],
      });
    },
  };
  