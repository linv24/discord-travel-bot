import { SlashCommandBuilder, ChatInputCommandInteraction, Attachment } from "discord.js";
import { processUploadedFile } from "discord/lib/process-uploaded-file";

export const data = new SlashCommandBuilder()
        .setName("upload")
        .setDescription("Upload a screenshot of flight itinerary.")
        .addAttachmentOption(option => 
            option.setName("file")
                .setDescription("Screenshot file to upload")
                .setRequired(true)
        );

export async function execute(interaction: ChatInputCommandInteraction) {
    const file: Attachment | null = interaction.options.getAttachment("file");

    if (!file) {
        await interaction.reply({ content: "No file provided.", ephemeral: true });
        return; 
    }

    const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
    ];

    const fileType = file.contentType ?? "";
    if (!allowedTypes.includes(fileType)) {
        await interaction.reply({
            content: "Please upload a valid file (PDF or image: PNG, JPG).",
            ephemeral: true,
        });
        return;
    }

    try {
        // for now, just storing file in buffer, but should eventually save to database
        const response = await fetch(file.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); 

        // call processing fucntion here
        await processUploadedFile(buffer, fileType);

        await interaction.reply(`Received **${file.name}** (${Math.round(buffer.length / 1024)} KB).`);
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "Failed to process the uploaded file.",
            ephemeral: true,
        });
    }
}

export default { data, execute };