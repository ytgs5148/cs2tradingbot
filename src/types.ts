interface SkinPortData {
    market_hash_name: string,
    currency: string,
    min_price: number,
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

interface Data {
    servers: {
        id: string,
        channel: {
            id: string,
            buyFrom: 'skinport' | 'buff163'
        }[],
        filters?: {
            maxPrice?: number,
            minPrice?: number,
            category?: string,
            quality?: string,
            exterior?: string
        }
    }[]
}

export {
    Data,
    SkinPortData,
    BuffData
}
