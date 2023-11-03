import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs'
import { Data } from '../types';

export default {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('View settings!'),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply()

        const notificationData: Data = JSON.parse(fs.readFileSync('./src/data.json', 'utf-8'))
        const serverData = notificationData.servers.find(s => s.id === interaction.guild?.id)

        if (!serverData) interaction.editReply('Add a channel first!')
        else {
            const { filters } = serverData
            const { channel } = serverData

            const embed = {
                title: 'Settings',
                description: `**Filters**\n**Max price:** ${filters?.maxPrice || '~~Not set~~'}\n**Min price:** ${filters?.minPrice || '~~Not set~~'}\n**Category**: ${filters?.category || '~~Not set~~'}\n**Quality:** ${filters?.quality || '~~Not set~~'}\n**Exterior:** ${filters?.exterior || '~~Not set~~'}\n\n**Channels**\n${channel.map(c => `<#${c.id}>: ${c.buyFrom}`).join('\n')}`
            }

            interaction.editReply({ embeds: [embed] })
        }
    }
}
