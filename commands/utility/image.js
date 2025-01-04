import { SlashCommandBuilder } from '@discordjs/builders';
import { imageHandler } from '../../utils/imageHandler.js';
import { AttachmentBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('image')
        .setDescription('Manage images')
        .addSubcommand(subcommand =>
            subcommand
                .setName('upload')
                .setDescription('Upload an image')
                .addAttachmentOption(option =>
                    option.setName('file')
                        .setDescription('The image to upload')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name for the image')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('get')
                .setDescription('Get an image')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the image')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all images'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete an image')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Name of the image to delete')
                        .setRequired(true))),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'upload': {
                    const file = interaction.options.getAttachment('file');
                    const name = interaction.options.getString('name');
                    const savedPath = await imageHandler.saveImage(file, name);
                    await interaction.editReply(`Image saved as ${name}`);
                    break;
                }
                case 'get': {
                    const name = interaction.options.getString('name');
                    const imagePath = await imageHandler.getImage(name);
                    const attachment = new AttachmentBuilder(imagePath);
                    await interaction.editReply({ files: [attachment] });
                    break;
                }
                case 'list': {
                    const images = await imageHandler.listImages();
                    if (images.length === 0) {
                        await interaction.editReply('No images found');
                    } else {
                        await interaction.editReply(`Available images:\n${images.join('\n')}`);
                    }
                    break;
                }
                case 'delete': {
                    const name = interaction.options.getString('name');
                    await imageHandler.deleteImage(name);
                    await interaction.editReply(`Deleted image ${name}`);
                    break;
                }
            }
        } catch (error) {
            await interaction.editReply(`Error: ${error.message}`);
        }
    }
};
