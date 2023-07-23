const { LogarithmicScale } = require("chart.js");
const { Client, GuildMember, Guild } = require("discord.js");
module.exports = {
  name: "guildMemberUnmute",

  /**
   *
   * @param {Client} client
   */
  //MEMBER SECTION
  async execute(oldMember, newMember) {
    const isOld = oldMember.isCommunicationDisabled();
    const isNew = newMember.isCommunicationDisabled();

    if (isOld && !isNew)
      await sendLogs(newMember.guild, newMember, "member", "Member unmuted!", [
        {
          name: "Time:",
          value: `<t:${newMember.communicationDisabledUntilTimestamp}:R>`,
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
  const db = require("../../schema/logs.js");
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
    color: "GREEN",
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
