import { CommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs'
import { Data } from '../types';

export default {
    data: new SlashCommandBuilder()
        .setName('add-channel')
        .setDescription('Adds a channel!')
        .addChannelOption(option => 
            option.setName('channel')
            .setDescription('The channel to add!')
            .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('buy-from')
            .setDescription('Select buy from:')
            .addChoices({ name: 'Skinport', value: 'skinport' })
            .addChoices({ name: 'Buff163', value: 'buff163' })
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const notificationData: Data = JSON.parse(fs.readFileSync('./src/data.json', 'utf-8'))
        const channelID = interaction.options.get('channel')?.value as string
        const type = interaction.options.get('buy-from')?.value as ('skinport' | 'buff163')

        const perms = (interaction.member?.permissions as PermissionsBitField)
        if (!perms.has('Administrator')) return interaction.editReply('You need to be an admin to use this command!')

        const serverData = notificationData.servers.find(s => s.id === interaction.guild?.id)

        if (!serverData) {
            notificationData.servers.push({
                id: interaction.guild?.id as string,
                channel: [{
                    id: channelID,
                    buyFrom: type,
                }]
            })

            interaction.editReply('Added channel!')
        } else {
            const channel = serverData.channel.find(c => c.id === channelID)

            if (channel) {
                channel.buyFrom = type
                interaction.editReply('Channel edited!')
            } else {
                serverData.channel.push({
                    id: channelID,
                    buyFrom: type
                })
                interaction.editReply('Added channel!')
            }
        }

        fs.writeFileSync('./src/data.json', JSON.stringify(notificationData))
    }
}
