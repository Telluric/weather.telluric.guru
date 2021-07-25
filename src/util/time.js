import {
    eachMinuteOfInterval,
    eachHourOfInterval,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    eachQuarterOfInterval,
    eachYearOfInterval, isEqual, getTime,
} from "date-fns";
console.debug('Util - Time Dependencies Loaded')

const eachOfIntervalMap ={
    minute: eachMinuteOfInterval,
    hour: eachHourOfInterval,
    day: eachDayOfInterval,
    week: eachWeekOfInterval,
    month: eachMonthOfInterval,
    quarter: eachQuarterOfInterval,
    year: eachYearOfInterval,
}

export function intervalToRange({period="hour", interval}){
    return eachOfIntervalMap[period](interval).map(getTime)
}
export function isEqualInterval(a,b){
    return (
        isEqual(a.start, b.start) &&
        isEqual(a.end, b.end)
    )
}
export function durationToPeriod (duration) {
    console.log('Util/Time => Duration To Period:', duration)
    let _period;
    if(duration.years > 0){
        if(duration.years > 1){
            _period = 'year'
        } else {
            _period = 'quarter'
        }
    } else if (duration.months > 0 ){
        _period = 'week'
    } else if (duration.weeks > 0){
        _period = 'day'
    } else if (duration.days > 0){
        if(duration.days > 1){
            _period = 'day'
        }else {
            _period = 'hour'
        }

    } else if (duration.hours > 0) {
        _period = 'minute'
    } else if (duration.minutes > 0){
        _period = 'second'
    }

    if(typeof _period === 'undefined') {
        _period = 'hour'
    };
    return _period;

}


export function periodIntervalsFromInterval (period, interval){
    console.log(...arguments)
    return eachOfIntervalMap[period](interval)
        .map(getTime)
        .reduce((res, next, index, dates) => {
            res.keys.push(next);
            if(typeof dates[index+1] !== 'undefined')
                res.intervals.push({start: next, end: dates[index+1]})
            return res;
        }, {period, keys:[], intervals: []})
    // return {
    //     period,
    //     keys: ,
    //     intervals: [{start: Date, end: Date}],
    // }
}



// Time range has two options
// One: Select each period within a time range to aggregate on. For instance an hour period for a day interval will return
//      24 dates/times on the top of every hour.
// Two: Selected time range will not aggregate
// Returns: array of intervals
// const tmp = {
//     period: 'hour',
//     keys: [Date],
//     intervals: [{start: Date, end: Date}],
// }
//
// }
