import {
    ApplicationCommandOptionData,
    CacheType,
    Client,
    CommandInteraction,
    CommandInteractionOptionResolver,
    PermissionResolvable,
} from 'discord.js';

interface IHandlerOptions {
    client: Client;
    testServerId: string;
    ownerId: string[];
}

interface ICommandParams {
    client: Client;
    interaction: CommandInteraction;
    options: Omit<CommandInteractionOptionResolver<CacheType>, 'getMessage' | 'getFocused'>;
}

interface ICommand {
    name: string;
    description: string;
    options: ApplicationCommandOptionData[];
    permissions?: PermissionResolvable[];
    testCommand?: boolean;
    ownerOnly?: boolean;
    requiresStart: boolean;
    run: (object: ICommandParams) => void;
}

interface SkinPortData {
    market_hash_name: string,
    currency: string,
    suggested_price: number,
    item_page: string,
    market_page: string,
}

interface BuffData {
    market_hash_name: string,
    quick_price: string,
    steam_market_url: string,
    id: number,
    buy_num: number
}

export {
    IHandlerOptions,
    ICommand,
    SkinPortData,
    BuffData
}
