const { LogarithmicScale } = require("chart.js");
const { Client, GuildMember, Guild } = require("discord.js");
module.exports = {
    name: "messageUpdate",

/**
 *
 * @param {Client} client
 */
  //MESSAGE SECTION
  async execute (old, newMsg) {
    if (newMsg.author?.bot) return;

    let oldContent = old.content.replace("`", "");
    let newContent = newMsg.content.replace("`", "");

    await sendLogs(newMsg.guild, newMsg.member, "message", "Message Edited", [
      {
        name: "In channel:",
        value: `<#${newMsg.channel.id}>`,
      },
      {
        name: "Before:",
        value: `\`\`\`${oldContent}\`\`\``,
      },
      {
        name: "After:",
        value: `\`\`\`${newContent}\`\`\``,
      },
    ]);
  },
};

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
      name: member.user.username,
      iconURL: member.user.displayAvatarURL(),
    },
    title,
    fields,
    color: "008000",
    footer: {
      text: `ID: ${member.id}`,
    },
  };

  if (!member.user.bot)
    embed.thumbnail = {
      url: member.user.displayAvatarURL(),
    };

  await channel.send({
    embeds: [embed],
  });
}
