const { LogarithmicScale } = require("chart.js");
const { Client, User, Guild } = require("discord.js");

module.exports = {
  name: "roleUpdate",

  /**
   *
   * @param {Client} client
   */
  // ROLE SECTION
  async execute(oldRole, newRole) {
    const botUser = oldRole.client.user;
    if (oldRole.name !== newRole.name || oldRole.permissions.bitfield !== newRole.permissions.bitfield || oldRole.color !== newRole.color) {
      await sendLogs(oldRole.guild, botUser, "role", "Role Updated!", [
          {
              name: "Old Role:",
              value: `${oldRole.name}`,
            },
            {
              name: "New Role:",
              value: `${newRole.name}`,
            },
      ]);
    }
  }
};

/**
 *
 * @param {Guild} guild
 * @param {User} user
 * @param {String} title
 * @returns
 */
async function sendLogs(guild, user, section, title, fields) {
  const db = require("../../Schemas/logSchema");
  const data = await db.findOne({
    guild: guild.id,
  });

  if (!data) return;
  const channel = guild.channels.cache.get(data.info[section]);
  if (!channel) return;

  const embed = {
    author: {
      name: user.username,
      iconURL: user.displayAvatarURL(),
    },
    title,
    fields,
    color: "008000",
    footer: {
      text: `ID: ${user.id}`,
    },
  };

  if (!user.bot)
    embed.thumbnail = {
      url: user.displayAvatarURL(),
    };

  await channel.send({
    embeds: [embed],
  });
}
