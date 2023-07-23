const { LogarithmicScale } = require("chart.js");
const { Client, User, Guild } = require("discord.js");

module.exports = {
  name: "roleCreate",

  /**
   *
   * @param {Client} client
   */
  // ROLE SECTION
  async execute(role) {
    const client = role.client;
    await sendLogs(role.guild, client.user, "role", "New Role Created!", [
      {
        name: "Role:",
        value: `${role}`,
      },
    ]);
  },
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
    title,
    fields,
    color: "008000",
  };

  if (user) {
    embed.author = {
      name: user.username,
      iconURL: user.displayAvatarURL(),
    };
    embed.footer = {
      text: `ID: ${user.id}`,
    };

    if (!user.bot) {
      embed.thumbnail = {
        url: user.displayAvatarURL(),
      };
    }
  }

  await channel.send({
    embeds: [embed],
  });
}

