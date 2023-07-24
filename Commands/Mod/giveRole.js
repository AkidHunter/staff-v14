const {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giverole")
    .setDescription("Give or remove someone a role.")
    .addRoleOption((options) =>
      options
        .setName("role")
        .setDescription("Provide a role to add or remove.")
        .setRequired(true)
    )
    .addUserOption((options) =>
      options
        .setName("target")
        .setDescription("Provide a user to manage.")
        .setRequired(false)
    ),
  /**
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const { options } = interaction;
    const role = options.getRole("role");
    const target = options.getMember("target") || interaction.member;
    const embed = new EmbedBuilder()
      .setColor(
        `#${interaction.guild.roles.cache.get(role.id).color.toString(16)}`
      )
      .setTitle("🎭 Role Management 🎭");

    console.log(interaction.member.roles.highest.position);

    if (
      !role.editable ||
      role.position === 0 ||
      interaction.member.roles.highest.position <= role.position
    ) {
      embed.setDescription(`I cannot edit the ${role} role!`);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    embed.setDescription(
      target.roles.cache.has(role.id)
        ? `Removed the ${role} role from ${target}.`
        : `Added the ${role} role to ${target}.`
    );
    target.roles.cache.has(role.id)
      ? target.roles.remove(role)
      : target.roles.add(role);
    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });
    setTimeout(() => message.delete().catch(() => {}), 5000);
  },
};
