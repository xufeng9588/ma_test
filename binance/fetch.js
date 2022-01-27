const async = require('async');
const { getKlineUrl } = require('./config');
const { dingdingrobot } = require('../../notice_clow-main/utils/dingding')
const { maData, ma5, ma20 } = require('../utils/transform');
const { transformKLine } = require('../../kline-main/utils/transform');
const { request } = require('../../request_api_data/request');
const { getMaBinanceTime } = require('../utils/transform');
const { forEach } = require('lodash');

const t = { start_time: '2022-1-5', end_time: new Date() }

function fetch(time, interval, size) {
    const require_type = ['SWAP'];
    // console.log(time.length)
    if (time) {
        var time_config = getMaBinanceTime(time.start_time, time.end_time, interval, size);
        var url_map = getKlineUrl(time_config, '4h', require_type, 100);
        console.log(time.start_time, time.end_time)
    } else if (!time) {
        var time_config = [];
        var url_map = getKlineUrl(time_config, '1m', require_type, 100);
    }
    // console.log(url_map)
    async.mapLimit(url_map, 3, async (d) => {
        const { url, exchange, asset_type, type, pair } = d;
        const ma_5_data = [];
        const ma_20_data = [];
        const row_data = await request(url);
        const first_process_data = await transformKLine(exchange, pair, asset_type, row_data);
        const hd = await maData(first_process_data);
        // console.log(hd,'hd...')
        const len = first_process_data.length;
        // if(len>=20){
        //     var kline5 = null;
        //     forEach(first_process_data,(l,index)=>{
        //         const { time ,close} = l;
        //         if(index>=95){
        //             kline5 += parseFloat(close)
        //             console.log(time,close)
        //         }
        //     })
        //     const ma5 = kline5 / 5;
        //     console.log(ma5,kline5,'ma55')
        // }
        for (let d = 1; d < hd.length - 20; d++) {
            const ma_5 = await ma5(hd, d);
            const ma_20 = await ma20(hd, d);
            ma_5_data.push(ma_5);
            ma_20_data.push(ma_20);
        }
        const board = `[恭喜发财] \n\n`;
        const title = `均线交叉 \n\n`;
        // const time = `最近一次均线交叉时间为：${ma_cross[0]} \n\n 均线交叉类型为：${ma_cross[1]}`
        for (let i = 4; i < ma_5_data.length; i++) {
            const time = ma_5_data[i - 4][0];
            const d5_new = ma_5_data[i - 4][1];
            const d20_new = ma_20_data[i - 4][1];
            const d5_yd = ma_5_data[i - 3][1];
            const d20_yd = ma_20_data[i - 3][1];
            if (d5_new >= d20_new && d5_yd < d20_yd) {
                const body = await transformMaData(time, ma_5_data, ma_20_data, i)
                const dingding_hd = board + title + body;
                console.log(dingding_hd)
                // dingdingrobot("均线交叉", dingding_hd);
            } else if (d5_new <= d20_new && d5_yd > d20_yd) {
                const body = await transformMaData(time, ma_5_data, ma_20_data, i)
                const dingding_hd = board + title + body;
                console.log(dingding_hd)
                // dingdingrobot("均线交叉", dingding_hd);
            }
        }
    })
    // console.log(url_map,time_config)
}

async function transformMaData(time, ma_5_data, ma_20_data, i) {
    const ct = new Date(time);
    const cross_time = await maTime(ct);
    const l = [ma_5_data[i - 4][2], ma_5_data[i - 3][2], ma_5_data[i - 2][2], ma_5_data[i - 1][2], ma_5_data[i][2]];
    const price = `价格为：${l} \n\n ma5价格为${ma_5_data[i - 4][1]} \n\n ma20价格为${ma_20_data[i - 4][1]}`
    var body = `时间：${cross_time} \n\n 均线交叉类型为：金叉 \n\n`;
    return body
}


async function maTime(t) {
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const date = t.getDate();
    const hours = t.getHours();
    const minutes = t.getMinutes();
    // const milliseconds = t.getMilliseconds()
    const hd = `${year}-${month}-${date} ${hours}:${minutes}`
    // console.log(hd)
    return hd
}


fetch('', 1, 100)