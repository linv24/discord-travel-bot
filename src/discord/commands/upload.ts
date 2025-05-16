import { SlashCommandBuilder, Interaction } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("upload")
        .setDescription("Upload a screenshot of flight itinerary."),
    async execute(interaction) {
        await interaction.reply("WIP: upload screenshot");
    },
};