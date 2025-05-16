import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("upload")
        .setDescription("Upload a screenshot of flight itinerary."),
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply("WIP: upload screenshot");
    },
};