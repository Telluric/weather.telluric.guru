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

export function eachPeriodOfInterval(period, interval){
    return eachOfIntervalMap[period](interval).map(getTime)
}
export function isEqualInterval(a,b){
    return (
        isEqual(a.start, b.start) &&
        isEqual(a.end, b.end)
    )
}
export function durationToPeriod (duration) {
    console.debug('Util/Time => Duration To Period:', duration)
    let _period;
    if(duration.years > 0){
        if(duration.years > 20){
            _period = 'year'
        } else {
            _period = 'quarter'
        }
    } else if (duration.months > 0 ){
        _period = 'week'
    } else if (duration.weeks > 0){
        _period = 'day'
    } else if (duration.days > 0){
        if(duration.days > 7){
            _period = 'day'
        }else {
            _period = 'hour'
        }

    } else if (duration.hours > 0) {
        _period = 'minute'
    } else if (duration.minutes > 0){
        _period = 'second'
    }

    if(typeof _period === 'undefined') throw new Error('No Period Found for Duration');
    return _period;

}
