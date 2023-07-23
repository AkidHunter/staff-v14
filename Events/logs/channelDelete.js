const { Client, GuildMember, Guild } = require("discord.js");

/**
 *
 * @param {Guild} guild
 * @param {GuildMember} member
 * @param {String} title
 * @returns
 */
async function sendLogs(guild, member, section, title, fields) {
  const db = require("../../Schemas/logSchema");
  const data = await db.findOne({
    guild: guild.id,
  });

  if (!data) return;
  const channel = guild.channels.cache.get(data.info[section]);
  if (!channel) return;

  const embed = {
    author: {
      name: member.username,
      iconURL: member.displayAvatarURL(),
    },
    title,
    fields,
    color: "008000",
    footer: {
      text: `ID: ${member.id}`,
    },
  };

  if (!member.bot)
    embed.thumbnail = {
      url: member.displayAvatarURL(),
    };

  await channel.send({
    embeds: [embed],
  });
}

module.exports = {
  name: "channelDelete",

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
      "Channel Deleted!",
      [
        {
          name: "Channel:",
          value: `${channel.name}`,
        },
      ]
    );
  }
};
