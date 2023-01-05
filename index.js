const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { Guilds, GuildMembers, GuildMessages, MessageContent} = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
  intents: [Guilds, GuildMembers, GuildMessages, MessageContent],
  partials: [User, Message, GuildMember, ThreadMember],
});

const { loadEvents } = require("./Handlers/eventHandler");


client.config = require("./config.json");
client.commands = new Collection();
client.subCommands = new Collection();
client.events = new Collection();
client.guildConfig = new Collection();


loadEvents(client);

// client.on('guildMemberRemove', async(member) => {
//     const { guild } = member;
//     const fetchedLogs = await member.guild.fetchAuditLogs({
//       limit: 1,
//       type: AuditLogEvent.MemberKick,
//     });

//     const kickLog = fetchedLogs.entries.first();
//     if (!kickLog) return;
//     console.log(kickLog)
//     const { executor, target } = kickLog;

//     moment(kickLog.createdTimestamp).format('l');
//     kickLog.createdTimestamp

// })

client.login(client.config.token)