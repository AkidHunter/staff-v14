const { LogarithmicScale } = require("chart.js");
const { Client, User, Guild } = require("discord.js");

/**
 *
 * @param {Guild} guild
 * @param {User} user
 * @param {String} section
 * @param {String} title
 * @param {Array} fields
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

module.exports = {
  name: "channelUpdate",

  /**
   *
   * @param {Client} client
   */
  //CHANNEL SECTION
  async execute(oldCh, newCh) {
    const botUser = oldCh.client.user;

    // Check if channel name has been updated
    const nameChanged = oldCh.name !== newCh.name;

    if (nameChanged) {
        await sendLogs(oldCh.guild, botUser, "channel", "Channel Updated!", [
            {
                name: "Old Channel:",
                value: `[#${oldCh.name}](https://discord.com/channels/${oldCh.guild.id}/${oldCh.id})`,
            },
            {
                name: "New Channel:",
                value: `[#${newCh.name}](https://discord.com/channels/${newCh.guild.id}/${newCh.id})`,
            },
        ]);
    }
  },
};
