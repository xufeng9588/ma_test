const { forEach, filter } = require("lodash");

const swap_base = 'https://fapi.binance.com/fapi/v1/klines?symbol='//swap
const future_base = 'https://dapi.binance.com/dapi/v1/klines?symbol=';//future
const spot_base = 'https://api.binance.com/api/v3/klines?symbol=';//usdt

// const swap_pairs = ['BTCUSDT','BTCUSDT_220325','BTCUSDT_220624'];
const swap_pairs = ['BTCUSDT'];
const spot_pairs = ['BTCUSDT'];
const future_pairs = ['BTCUSD_220325', 'BTCUSD_220624', 'BTCUSD_PERP']
const kline_config = [
    {
        type: 'SWAP',
        pairs: swap_pairs,
        base: swap_base
    },
    {
        type: 'SPOT',
        pairs: spot_pairs,
        base: spot_base
    },
    {
        type: 'FUTURE',
        pairs: future_pairs,
        base: future_base
    }
]
const quarter_config = [{ value: 'QUARTER', time: '220325' }, { value: 'NEXT_QUARTER', time: '220624' }];
function getPairAssetType(row_pair, type) {
    if (type === 'SWAP') {
        if (row_pair.endsWith('USDT')) {
            const p = row_pair.replace('USDT', '-USDT');
            return { pair: p, asset_type: 'SWAP' };
        } else {
            const r = row_pair.split('_');
            const p = r[0].replace('USDT', '-USDT');
            const a = r[1];
            const asset = filter(quarter_config, l => l.time === a);
            const asset_type = asset[0]['value'];
            // console.log(p, asset_type, row_pair)
            return { pair: p, asset_type }
        }
    } else if (type === 'SPOT') {
        const p = row_pair.replace('USDT', '-USDT');
        return { pair: p, asset_type: 'SPOT' };
    } else {
        if (row_pair.endsWith('PERP')) {
            const p = row_pair.replace('USD_PERP', '-USD');
            return { pair: p, asset_type: 'SWAP' };
        } else {
            const r = row_pair.split('_');
            const p = r[0].replace('USD', '-USD');
            const a = r[1];
            const asset = filter(quarter_config, l => l.time === a);
            const asset_type = asset[0]['value'];
            // console.log(p, asset_type, row_pair)
            return { pair: p, asset_type }
        }
    }
}
const time_config = [{ from: 'xx', to: 'xx' }, {}]
function getKlineUrl(time_config, interval, require_type, size) {
    const handle_data = [];
    const exchange = 'BINANCE'
    forEach(kline_config, l => {
        const { pairs, type, base } = l;
        if (require_type.includes(type)) {
            forEach(pairs, m => {
                if (time_config && time_config.length) {
                    //如果有开始结束时间
                    forEach(time_config,n=>{
                        const { from ,to} = n;
                        const url= `${base}${m}&startTime=${from}&endTime=${to}&interval=${interval}`;
                        const { pair, asset_type } = getPairAssetType(m, type);
                        const o = { url, exchange, type, pair, asset_type};
                        handle_data.push(o);
                    })
                } else {
                    const url = `${base}${m}&interval=${interval}&limit=${size}`;
                    const { pair, asset_type } = getPairAssetType(m, type);
                    // console.log(pair)
                    const o = { url, exchange, type, pair, asset_type};
                    // console.log(o,'oooo')
                    handle_data.push(o);
                }
            })
        }
    })
    // console.log(handle_data)
    return handle_data
}

const require_type = ['SWAP'];

// getKlineUrl([],'1m',require_type)
module.exports = {
    getKlineUrl
}