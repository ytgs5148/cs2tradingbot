/* eslint-disable @typescript-eslint/ban-ts-comment */
import DiscordJS, { ButtonBuilder, ButtonStyle, Collection, EmbedBuilder, GatewayIntentBits, REST, Routes, SlashCommandBuilder, TextChannel } from 'discord.js'
import Dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import fs from 'node:fs'
import { BuffData, Data, SkinPortData } from './types'

Dotenv.config({
    path: './src/.env'
})

const Client = new DiscordJS.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
}) as DiscordJS.Client & { commands: DiscordJS.Collection<string, any> }

// Client.commands = new Collection()

Client.on('ready', async (client) => {
    console.log(`${client.user.username} is online`)
    
    setInterval(async () => {
        const itemsSkinPort: SkinPortData[] = (await axios.get('https://api.skinport.com/v1/items?app_id=730&currency=USD')).data
        const notificationSetting: Data = JSON.parse(fs.readFileSync('./src/data.json', 'utf-8'))

        notificationSetting.servers.forEach(async server => {
            let totalPage = 1
            let filter = ''

            server.filters?.minPrice ? filter += `&min_price=${Math.round((server.filters?.minPrice || 1) / parseFloat(process.env.CONVERSION_FROM_YEN || '1'))}` : null
            server.filters?.maxPrice ? filter += `&max_price=${Math.round((server.filters?.maxPrice || 1) / parseFloat(process.env.CONVERSION_FROM_YEN || '1'))}` : null
            server.filters?.category ? filter += `&category_group=${server.filters?.category}` : null
            server.filters?.exterior ? filter += `&exterior=${server.filters?.exterior}` : null
            server.filters?.quality ? filter += `&quality=${server.filters?.quality}` : null

            const textChannelWithSkinportBuyID = server.channel.find(c => c.buyFrom == 'skinport')
            const textChannelWithBuffBuyID = server.channel.find(c => c.buyFrom == 'buff163')

            const textChannelWithSkinportBuy = Client.channels.cache.get(textChannelWithSkinportBuyID?.id || '') as TextChannel
            const textChannelWithBuffBuy = Client.channels.cache.get(textChannelWithBuffBuyID?.id || '') as TextChannel

            if (!textChannelWithSkinportBuy && !textChannelWithBuffBuy) return console.log('Could not find channel!')

            for (let j = 1; j <= totalPage; j++) {
                const itemsBuff163Raw: { items: BuffData[], total_page: number, error?: string } = (await axios.get(`https://buff.163.com/api/market/goods?appid=730&page_num=${j}&page_size=80${filter}`, {
                    headers: {
                        Cookie: process.env.COOKIE
                    }
                })).data.data

                if (itemsBuff163Raw.error) return console.log(itemsBuff163Raw.error)
                const itemsBuff163 = itemsBuff163Raw.items
    
                totalPage = itemsBuff163Raw.total_page
    
                const profitableProductsWithSkinPortBuy: { skinport: SkinPortData, buff163: BuffData, profit: number }[] = []
                const profitableProductsWithBuffBuy: { skinport: SkinPortData, buff163: BuffData, profit: number }[] = []
    
                itemsBuff163.forEach(i => {
                    const item = itemsSkinPort.find(itemSkinPort => itemSkinPort.market_hash_name === i.market_hash_name)
                    const skinportPrice = item?.min_price
                    const buff163Price = parseFloat(i.quick_price) * (parseFloat(process.env.CONVERSION_FROM_YEN || '1'))
    
                    if (!skinportPrice || !buff163Price || (Math.abs(buff163Price - skinportPrice)) < parseInt(process.env.PROFIT || '0', 10)) return

                    if (skinportPrice > buff163Price) {
                        profitableProductsWithBuffBuy.push({
                            skinport: item,
                            buff163: i,
                            profit: Math.abs(skinportPrice - buff163Price)
                        })
                    } else {
                        profitableProductsWithSkinPortBuy.push({
                            skinport: item,
                            buff163: i,
                            profit: Math.abs(skinportPrice - buff163Price)
                        })
                    }
                })
    
                console.log(`Found Skinport -> ${profitableProductsWithSkinPortBuy.length}, Buff -> ${profitableProductsWithBuffBuy.length} products in page ${j}/${totalPage}`)
    
                textChannelWithSkinportBuy && profitableProductsWithSkinPortBuy.forEach(async p => {
                    const embed = new EmbedBuilder()
                        .setTitle(p.skinport.market_hash_name)
                        .setDescription(`On Sale: ${p.buff163.buy_num}`)
                        .addFields([{
                                name: 'Skinport',
                                value: `$${p.skinport.min_price}`,
                            }, {
                                name: 'Buff163',
                                value: `$${parseFloat(p.buff163.quick_price) * (parseFloat(process.env.CONVERSION_FROM_YEN || '1'))}`,
                            }, {
                                name: 'Profit',
                                value: `$${p.profit}`,
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
                        .setURL(`https://buff.163.com/goods/${p.buff163.id}?from=market#tab=selling`);
    
                    textChannelWithSkinportBuy.send({
                        embeds: [embed],
                        components: [
                            {
                                type: 1,
                                components: [button1, button2]
                            }
                        ]
                    })
                })

                textChannelWithBuffBuy && profitableProductsWithBuffBuy.forEach(async p => {
                    const embed = new EmbedBuilder()
                        .setTitle(p.skinport.market_hash_name)
                        .setDescription(`On Sale: ${p.buff163.buy_num}`)
                        .addFields([{
                                name: 'Skinport',
                                value: `$${p.skinport.min_price}`,
                            }, {
                                name: 'Buff163',
                                value: `$${parseFloat(p.buff163.quick_price) * (parseFloat(process.env.CONVERSION_FROM_YEN || '1'))}`,
                            }, {
                                name: 'Profit',
                                value: `$${p.profit}`,
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
                        .setURL(`https://buff.163.com/goods/${p.buff163.id}?from=market#tab=selling`);
    
                    textChannelWithBuffBuy.send({
                        embeds: [embed],
                        components: [
                            {
                                type: 1,
                                components: [button1, button2]
                            }
                        ]
                    })
                })
    
                console.log('Waiting 2 seconds')
                await new Promise(resolve => { setTimeout(resolve, 2000) })
            }
        })
    }, (parseInt(process.env.SECONDS || '10', 10)) * 1000)
})

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
const commands: any[] = [];
const rest = new REST().setToken(process.env.TOKEN as string);

(async () => {
    try {
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            await import(filePath).then(async (command) => {
                if ('data' in command.default && 'execute' in command.default) {
                    commands.push(command.default);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }).catch((err) => {
                console.log(`[ERROR] Failed to import command at ${filePath}: ${err}`);
            });
        }

        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID as string),
            { body: commands.map(command => command.data.toJSON()) },
        )

        console.log(`Successfully reloaded ${(data as any[]).length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

Client.login(process.env.TOKEN)

Client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return

    commands.find(c => c.data.name == interaction.commandName).execute(interaction)
})

Client.login(process.env.TOKEN)
