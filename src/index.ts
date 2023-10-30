import DiscordJS, { ButtonBuilder, ButtonStyle, EmbedBuilder, GatewayIntentBits } from 'discord.js'
import Dotenv from 'dotenv'
import axios from 'axios'
import { BuffData, SkinPortData } from './types'

Dotenv.config({
    path: './src/.env'
})

const Client = new DiscordJS.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
})

Client.on('ready', async () => {
    console.log('Bot is online!')
})

Client.on('messageCreate', async (message) => {
    if (message.author.bot) return

    if (message.content !== '!check') return

    const itemsSkinPort: SkinPortData[] = (await axios.get('https://api.skinport.com/v1/items?app_id=730&currency=USD')).data
    const itemsBuff163: BuffData[] = (await axios.get('https://buff.163.com/api/market/goods?appid=730&currency=USD&page_size=50000')).data.data.items

    const profitableProducts: { skinport: SkinPortData, buff163: BuffData, profit: number }[] = []

    itemsBuff163.forEach((i, index) => {
        const item = itemsSkinPort.find(itemSkinPort => itemSkinPort.market_hash_name === i.market_hash_name)
        const skinportPrice = item?.suggested_price
        const buff163Price = parseFloat(i.quick_price)

        if (!skinportPrice || !buff163Price || skinportPrice == buff163Price || (Math.abs(skinportPrice - buff163Price)) < parseInt(process.env.PROFIT || '0', 10)) return

        profitableProducts.push({
            skinport: item,
            buff163: i,
            profit: Math.abs(skinportPrice - buff163Price)
        })
    })

    console.log(`Found ${profitableProducts.length} products`)

    profitableProducts.forEach(p => {
        const embed = new EmbedBuilder()
            .setTitle(p.skinport.market_hash_name)
            .setDescription(`On Sale: ${p.buff163.buy_num}`)
            .addFields([
                {
                    name: 'Skinport',
                    value: `$${p.skinport.suggested_price}`
                },
                {
                    name: 'Buff163',
                    value: `$${p.buff163.quick_price}`
                },
                {
                    name: 'Profit',
                    value: `$${p.profit}`
                }
            ])
            .setColor('#FF0000')

        const button1 = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Skinport')
            .setURL(p.skinport.market_page)
        
        const button2 = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Buff163')
            .setURL(`https://buff.163.com/goods/${p.buff163.id}?from=market#tab=selling`)

        message.channel.send({
            embeds: [embed],
            components: [
                {
                    type: 1,
                    components: [button1, button2]
                }
            ]
        })
    })
})

Client.login(process.env.TOKEN)
