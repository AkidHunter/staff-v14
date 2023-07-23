const { LogarithmicScale } = require("chart.js");
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

  module.exports = {
    name: "guildMemberUpdate",
  /**
 *
 * @param {Client} client
 */
  //MEMBER SECTION
  async execute (oldMember, newMember) {
    const isOld = oldMember.isCommunicationDisabled();
    const isNew = newMember.isCommunicationDisabled();

    if (!isOld && isNew) {
      let time = newMember.communicationDisabledUntilTimestamp;
      let now = new Date();
      let finalTimeUnix = Math.floor(time / 1000);

      await sendLogs(newMember.guild, newMember, "member", "Member muted!", [
        {
          name: "Ending:",
          value: `<t:${finalTimeUnix}:R>`,
        },
        {
          name: "User:",
          value: `${newMember}`
        },
      ]);
    }
  }
}