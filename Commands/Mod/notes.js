const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    time,
  } = require("discord.js");
  const { Types } = require("mongoose");
  
  const noteSchema = require("../../Schemas/noteSchema");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("note")
      .setDescription("Add a note to a user")
      .addSubcommand((subCmd) =>
        subCmd
          .setName("add")
          .setDescription("Add a note to a user.")
          .addUserOption((option) => {
            return option
              .setName("user")
              .setDescription("The user to add a note to.")
              .setRequired(true);
          })
          .addStringOption((option) => {
            return option
              .setName("note")
              .setDescription("The note to add to the user.")
              .setRequired(true)
              .setMaxLength(110)
          })
      )
      .addSubcommand((subCmd) =>
        subCmd
          .setName("remove")
          .setDescription("Remove a note from a user.")
          .addStringOption((option) => {
            return option
              .setName("id")
              .setDescription("The ID of the note.")
              .setRequired(true);
          })
      )
      .addSubcommand((subCmd) =>
        subCmd
          .setName("edit")
          .setDescription("Edit a note from a user.")
          .addStringOption((option) => {
            return option
              .setName("id")
              .setDescription("The ID of the note to edit.")
              .setRequired(true);
          })
          .addStringOption((option) => {
            return option
              .setName("note")
              .setDescription("The note to edit from a user.")
              .setRequired(true);
          })
      ),
  
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
      const { options, member, guild } = interaction;
  
      switch (options.getSubcommand()) {
        case "add":
          const note = options.getString("note");
          const usr = options.getUser("user");
          const noteTime = time();
          
          const newSchema = new noteSchema({
            _id: Types.ObjectId(),
            guildId: guild.id,
            userId: usr.id,
            note: note,
            moderator: member.user.id,
            noteDate: noteTime,
          });
          
          newSchema.save().catch((err) => console.log(err));

          const data = await noteSchema.findOne({
            guildId: guild.id,
            userId: usr.id,
          });
          
          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Note Id: ${newSchema._id}`) // Use newSchema._id here
                .setDescription(
                  `Added a new note to ${usr}!\n> Note: \`${note}\`\n> Moderator: <@${member.user.id}>\n> Date: ${noteTime}`
                )
                .setColor("#2f3136"),
            ],
          });
          break;
  
        case "remove":
        const noteIdToRemove = options.getString("id");

        const dataToRemove = await noteSchema.findOne({
          _id: noteIdToRemove, // Use the _id field to find the note
          guildId: guild.id,
        });

        if (!dataToRemove) {
          const error = new EmbedBuilder()
            .setTitle("ERROR")
            .setDescription(`No notes matching \`${noteIdToRemove}\` was found in the database.`)
            .setColor("FF0000");

          await interaction.reply({ embeds: [error], ephemeral: true });
          return; // Return here to prevent further execution of the code
        }

        dataToRemove.delete();

        const success = new EmbedBuilder()
          .setTitle("Success")
          .setColor("Green")
          .setDescription(
            `Successfully removed the note from <@${dataToRemove.userId}>!`
          );

        await interaction.reply({
          embeds: [success],
          ephemeral: true,
        });
        break;
  
        case "edit":
          const newNote = options.getString("note");
          const newId = options.getString("id");
  
          const newData = await noteSchema.findById(newId);
  
          const err = new EmbedBuilder()
            .setTitle("ERROR")
            .setDescription(
              `No notes matching \`${newId}\` was found in the database.`
            )
  
          if (!newData) await interaction.reply({ embeds: [err], ephemeral: true });
  
          await noteSchema.findOneAndUpdate(
            { guildId: guild.id, _id: newId },
            { note: newNote }
          );
  
          const suc = new EmbedBuilder()
            .setTitle("Success")
            .setColor("Green")
            .setDescription(
              `Successfully edited the note from <@${newData.userId}> to \`${newNote}\``
            );
  
          await interaction.reply({
            embeds: [suc],
            ephemeral: true,
          });
        default:
          break;
      }
    },
  };
  