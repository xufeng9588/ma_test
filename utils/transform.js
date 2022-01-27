const _ = require('lodash');
const kLine = require('../schema/kLine.json');
const { DBLink } = require('../../utils/database_influx_pg/link_influx');

// const dbLink = new DBLink(host = 'localhost', port = 8086, database = 'bfs');
// dbLink.loadModelConfigs([kLine]);

function maTimeTransforms(date){
    const t = Math.round(date.getTime());
    const yt = new Date(t - 3600000).getTime();
    const time = [t, yt];
    return time
}

async function maData(data) {
    // const d = await dbLink.Query('kLine', 'exchange', 'BINANCE');
    const handle_data = [];
    _.forEach(data,d => {
        const time = d.time;
        const cd = d.close;
        const hd = parseFloat(cd);
        const input = [time, hd]
        handle_data.push(input)
    });
    // console.log(data, 'kkk')
    return handle_data
}

async function ma5(data, d) {
    let arr = 0;
    for (let i = d; i < d + 5; i++) {
        arr += parseFloat(data.at(-i)[1]);
    }
    var s = arr/5;
    const hd = [data.at(-d)[0],s,data.at(-d)[1]]
    // console.log(data.at(-d)[1])
    return hd
}

async function ma20(data, d) {
    let arr = 0;
    for (let i = d; i < d + 20; i++) {
        arr += parseFloat(data.at(-i)[1]);
    }
    var s = arr/20;
    const hd = [data.at(-d)[0],s,data.at(-d)[1]]
    return hd
}

function getTimeStemp(time) {
    return new Date(time).getTime();
}

function getMaBinanceTime(startTime, endTime, interval, size) {
    const t = new Date().getTime();
    const int = interval * 60 * 1000;
    const st = getTimeStemp(startTime);
    const et = endTime === 'now' ? t : getTimeStemp(endTime);
    const dataGap = size * int;
    const number = Math.round((et - st) / dataGap) + 1;
    const time = [];
    for (let index = 0; index < number; index++) {
        const startTime = st - (dataGap * index);
        const endTime = et - (dataGap * index);
        const sTime = Math.round(startTime);
        const eTime = Math.round(endTime);
        const o = { from: sTime, to: eTime };
        time.push(o);
    }
    // console.log(time)
    return time
}
// async function ma5_transform(data){
//     _.forEach
// }

// maData()
module.exports = {
    maData,
    ma5,
    ma20,
    maTimeTransforms,
    getMaBinanceTime
}