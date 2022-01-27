const _ = require('lodash')
const { getBinanceMD } = require('../kline-main/exchange/binance');
const { transformKLine } = require('../kline-main/utils/transform')
const { request } = require('../request_api_data/request');
const { maData, ma5, ma20 } = require('./utils/transform');
const { dingdingrobot } = require('../notice_clow-main/utils/dingding');
const { forEach } = require('lodash');

async function maCrossover(coin) {
    const pairs = [coin];
    const t = Math.round(new Date().getTime());
    const yt = new Date(t - 3600000);
    // 1728000000
    const ma20time = yt.toISOString();
    const allUrl = await getBinanceMD(ma20time, new Date(), pairs, 'influx');
    const ma5Data = [];
    const ma20Data = [];
    _.forEach(allUrl, async u => {
        const data = await request(u[0]);
        const handleData = await transformKLine('BINANCE', u[1], 'SWAP', data);
        const row_data = [];
        forEach(handleData, l => {
            const { time, close } = l;
            const o = { time, close };
            row_data.push(o)
        })
        console.log(row_data,'row...')
        // console.log(handleData)
        const ma = await maData(handleData);
        const madata5 = await ma5(ma, 1);
        const madata20 = await ma20(ma, 1);
        ma5Data.push(madata5);
        ma20Data.push(madata20);
    })
    // console.log(new Date(),ma20time)
    setTimeout(() => {
        console.log(ma5Data, ma20Data)
    }, 5000);
    for (let i = 0; i < ma5Data.length; i++) {
        if (ma5Data[i] > ma20Data[i] && ma5Data[i + 1] < ma20Data[i + 1]) {
            dingdingrobot("均线交叉", "金叉")
        } else if (ma5Data[i] <= ma20Data[i] && ma5Data[i + 1] > ma20Data[i + 1]) {
            dingdingrobot("均线交叉", "死叉")
        }
    }
}
maCrossover('BTC-USDT')


// function maTimeTransforms(date){
//     const t = Math.round(date.getTime())
// }