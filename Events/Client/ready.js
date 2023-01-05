const { loadCommands } = require("../../Handlers/commandHandler");
const mongoose = require("mongoose");
const { Database } = require("../../config.json");
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log("The Client is now ready.");

    let activities = [
      {
          text: `Zybre Discord`,
          type: ActivityType.Watching, 
          status: "online" 
      },
      {
          text: `Zybre Client`,
          type: ActivityType.Playing,
          status: "online"
      },
      {
          text: `Zybre Conmmunity`,
          type: ActivityType.Watching,
          status: "online"
      },
  ];
  let c = 0;

  setInterval(() => {
      let activity = activities[c];
      client.user.setPresence({
          activities: [
              {
                  name: activity.text,
                  type: activity.type,
                  url: activity.url
              }
          ],
          status: activity.status
      });
      c = c >= activities.length - 1 ? 0 : c + 1;
  }, 10 * 1000); // 30 seconds

    if (!Database) return;
    mongoose
      .connect(Database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("The client is now connected to the database!");
      })
      .catch((err) => {
        console.log(err);
      });

    loadCommands(client);
  },
};