import { CommandInteraction, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import fs from 'node:fs'
import { Data } from '../types';

export default {
    data: new SlashCommandBuilder()
        .setName('add-filters')
        .setDescription('Adds a filter!')
        .addNumberOption(option => 
            option.setName('max_price')
            .setDescription('Maximum buy price')
            .setRequired(false)
        )
        .addNumberOption(option => 
            option.setName('min_price')
            .setDescription('Minimum buy price')
            .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('category')
            .setDescription('Enter category id:')
            .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('quality')
            .setDescription('Choose quality:')
            .addChoices({ name: 'Normal', value: 'normal' })
            .addChoices({ name: 'Souvenir', value: 'tournament' })
            .addChoices({ name: 'StatTrek', value: 'strange' })
            .addChoices({ name: '⭐', value: 'unusual' })
            .addChoices({ name: '⭐StatTrek', value: 'unusual_strange' })
            .setRequired(false)
        )
        .addStringOption(option => 
            option.setName('exterior')
            .setDescription('Choose exterior:')
            .addChoices({ name: 'Factory New', value: 'wearcategory0' })
            .addChoices({ name: 'Minimal Wear', value: 'wearcategory1' })
            .addChoices({ name: 'Field-Tested', value: 'wearcategory2' })
            .addChoices({ name: 'Well-work', value: 'wearcategory3' })
            .addChoices({ name: 'Battle Scarred', value: 'wearcategory4' })
            .setRequired(false)
        ),
    execute: async (interaction: CommandInteraction) => {
        await interaction.deferReply({ ephemeral: true })

        const notificationData: Data = JSON.parse(fs.readFileSync('./src/data.json', 'utf-8'))
        const maxPrice = interaction.options.get('max_price')?.value as number
        const minPrice = interaction.options.get('min_price')?.value as number
        const category = interaction.options.get('category')?.value as string
        const quality = interaction.options.get('quality')?.value as string
        const exterior = interaction.options.get('exterior')?.value as string

        const serverData = notificationData.servers.find(s => s.id === interaction.guild?.id)

        const perms = (interaction.member?.permissions as PermissionsBitField)
        if (!perms.has('Administrator')) return interaction.editReply('You need to be an admin to use this command!')

        if (!serverData) interaction.editReply('Add a channel first!')
        else {
            serverData.filters = {
                maxPrice,
                minPrice,
                category,
                quality,
                exterior
            }

            interaction.editReply('Filters added!')
        }

        fs.writeFileSync('./src/data.json', JSON.stringify(notificationData))
    }
}
