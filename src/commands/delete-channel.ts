import { CommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs'
import { Data } from '../types';

export default {
    data: new SlashCommandBuilder()
        .setName('delete-channel')
        .setDescription('Deletes a channel!')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The channel to delete!')
            .setRequired(true)
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const notificationData: Data = JSON.parse(fs.readFileSync('./src/data.json', 'utf-8'))
        const channelID = interaction.options.get('channel')?.value as string

        const serverData = notificationData.servers.find(s => s.id === interaction.guild?.id)

        const perms = (interaction.member?.permissions as PermissionsBitField)
        if (!perms.has('Administrator')) return interaction.editReply('You need to be an admin to use this command!')

        if (!serverData) interaction.editReply('You havent added any channel!')
        else {
            const channelIndex = serverData.channel.findIndex(c => c.id === channelID)

            if (channelIndex !== -1) {
                serverData.channel.splice(channelIndex, 1)
                interaction.editReply('Channel deleted!')
            } else interaction.editReply('Channel not added yet.')
        }

        fs.writeFileSync('./src/data.json', JSON.stringify(notificationData))
    }
}
