const { Client, User, Guild } = require("discord.js");

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

module.exports = {
  name: "channelCreate",

  /**
   *
   * @param {Client} client
   */
  //CHANNEL SECTION
  async execute (channel) {
    const client = channel.client; // Get the client (bot) from the channel
    await sendLogs(
      channel.guild,
      client.user, // Pass the client's user to the sendLogs function
      "channel",
      "New Channel Created!",
      [
        {
          name: "Channel:",
          value: `${channel}`,
        },
      ]
    );
  }
};
