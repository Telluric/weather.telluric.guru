import './App.css';
import {useEffect, useLayoutEffect, useState} from "react";

import Chart from 'react-apexcharts'
import CircularProgress from "@material-ui/core/CircularProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import {WeatherFooter, WeatherToolbar} from "./components/Controls";

import {findMinStartDate, request} from "./util/db";
import {getTime, subDays} from "date-fns";


import {useTheme} from "@material-ui/core/styles";

import * as ApexCharts from "apexcharts";
console.debug('App => Loading...')


/**
 * Two Axes Weather Chart
 * @param db
 * @returns {JSX.Element}
 * @constructor
 */
export default function WeatherApp({db}) {
    console.debug('App => Running...')

    const [isLoading, setIsLoading] = useState(true);


    /**
     * The X Axis
     */
    const [x] = useState([])


    const [names] = useState(['temperature', 'humidity'])

    const [leftSeries, setLeftSeries] = useState({
        name: 'temperature',
        data: x.map((v, i) => [v, Array.from(Array(25).keys())[i]]),
        // forceNiceScale: true,
    })

    const [rightSeries, setRightSeries] = useState({
        name: 'humidity',
        data: x.map((v, i) => [v, Array.from(Array(25).keys())[i]]),
        // forceNiceScale: true,
    })

    const [series, setSeries] = useState([
        leftSeries,
        rightSeries
    ])

    const onRangeData = ({d, range}) => {
        console.debug('App => So Much Data', d)
        setIsLoading(false);

        setSeries(Array.from(series).map((s, index) => {
            return {
                name: names[index],
                data: d[index].map((record, i) => [range[i], (typeof record !== 'undefined' ? Math.round(record.sum / record.count) : undefined)]),
            }

        }))
    }

    const _options = {
        chart: {
            id: 'realtime',
        },
        dataLabels: {
            enabled: true,
        },
        markers: {
            size: 3,
        },
        stroke: {
            curve: 'smooth'
        },
        animations: {
            enabled: true,
            easing: 'linear',
        },
        tooltip: {
            x: {
                show: true,
                format: 'MMM \'yy hh:mm TT',
                formatter: undefined,
            },
        },
        xaxis: {
            type: 'datetime',
        },
        yaxis: [{
            opposite: false,
        }, {
            opposite: true,
        }]

    }
    const [period, setPeriod] = useState('hour')
    useEffect(()=>{
      onDateRangeSubmitted({start: getTime(subDays(Date.now(), 1)), end: Date.now(), period})
    },[db])
    const onDateRangeSubmitted = ({start, end, period}) => {
        console.debug('App => On Date Range Submitted---------------', {start,end,period});
        setIsLoading(true)
        setPeriod(period);
        let range = eachPeriodOfInterval(period, {start,end}).map((d)=>getTime(d));
        //setX(range);
        getRangeSelection({range, names}, (d) => onRangeData({d, range}));
    }
    useEffect(() => {
        console.debug("App => Series Updated", series)
        // series[0].data.reduce((a,b) => b[1] > a[1] ? a[1] : b[1])
        let minMax = []
        series.forEach((s) => {
            let gather = []
            if (s.data.length > 0) {
                gather.push(s.data.map((d, i) => {
                    if (isNaN(d[1])) return s.data[i - 1]
                    return d[1];
                }));
            }
            minMax.push(gather)
        })
        let send = {
            yaxis: minMax.map((obs, index) => {
                if (obs.length > 0) {
                    let obsf = obs.filter((o) => typeof o !== 'undefined')
                    let min = Math.round(Math.min(...obsf[0]));
                    let max = Math.round(Math.max(...obsf[0]));
                    let difference = max - min
                    return {
                        opposite: index === 1,
                        min: Math.round(min - (difference * 0.35)),
                        max: Math.round(max + (difference * 0.35)),
                    }
                } else {
                    return obs
                }

            })
        }
        console.debug(send)
        if(!isLoading)
            ApexCharts.exec('realtime', 'updateOptions', send)

    }, [series])



    const [minDate, setMinDate] = useState()

    /**
     * Set Minimum Date
     */
    useEffect(()=>{
        async function getDocs(){
            let {rows} = await db.allDocs({limit: 1, sort: 'desc'})
            if(rows.length && rows.length > 0){
                setMinDate(parseInt(rows[0].id))
            }
        }

        getDocs();
    }, [db])

    const [minDate, setMinDate] = useState(getTime(subDays(Date.now(), 1)));

    const [_names, setNames] = useState(['temperature', 'humidity']);

    useEffect(()=>{
        console.log('Names Change', _names)
        console.log('')
        if(interval && interval.start){
                // console.log({
                //     names: [name],
                //     interval,
                //     period:_period
                // })
                handleDateIntervalSubmitted({
                    names: _names,
                    interval,
                    period:_period
                })
            }
    }, [_names])

    // STUB for Sensors
    const onSensorToggled = (e, name) => {
        console.log(`App => Sensor ${name} toggled!`, interval, _period)
        let state = Array.from(_names)
        if(state.includes(name)){
            console.log('Clicked is the same as the last click Names:', _names)
            state.splice(state.indexOf(name), 1)
            console.log('Clicked is the same as the last click Names:', state)
        } else if (state.length < 2) {
            state.push(name)
        } else if (state.length === 2){
            state.shift()
            state.push(name)
        }

        setNames(state)
        // setClicked(name);
        //
    };
    // STUB for Realtime Toggle
    const onSyncToggled = console.log;

    // await request({names: ['temperature', 'humidity'], period, interval:{start,end}})
    const [options] = useState({
        chart: {
            id: 'realtime',
            type: 'line',
        },
        stroke: {
            curve: 'smooth',
        },
        markers: {
            size: 5,
        },
        tooltip: {
            x: {
                show: true,
                format: 'MMM dd \'yy hh:mm TT',
            },
            // custom: function({ seriesIndex, dataPointIndex, w }) {
            //     let o = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
            //     let h = w.globals.seriesCandleH[seriesIndex][dataPointIndex]
            //     let l = w.globals.seriesCandleL[seriesIndex][dataPointIndex]
            //     let c = w.globals.seriesCandleC[seriesIndex][dataPointIndex]
            //     return (
            //         `O:${o} H:${h} L:${l} C:${c}`
            //     )
            // }
        },
        xaxis: {
            type: 'datetime'
        },
        // yaxis: [{
        //     // opposite:false,
        // },{
        //     opposite:true,
        // }, ]

    })
    const [series, setSeries] = useState()
    const [interval, setInterval] = useState()
    const [_period, setPeriod] = useState('hour')
    const handleDateIntervalSubmitted = ({names, interval, period}) => {
        setIsLoading(true)
        setInterval(interval)
        return request({names, period, interval})
            .then((x)=>{
                console.log(x);
                setSeries(x)
            })
            .then(()=>setIsLoading(false))
            .then(()=>{
                setPeriod(period)
                // ApexCharts.exec('realtime', 'updateOptions', {
                //     chart: {type: 'line'},
                //     // yaxis: names.map((name,index)=>{
                //     //     return {
                //     //         opposite: index % 2 === 0,
                //     //         title:{
                //     //             text: name
                //     //         }
                //     //     }
                //     // })
                // })

            })
    }

    useEffect (()=>{
        async function initLoad(){
            setIsLoading(true)

            let min = await findMinStartDate(db)

            setMinDate(min);
            setInterval({start: getTime(subDays(Date.now(), 1)), end: Date.now()})
            await handleDateIntervalSubmitted({
                names: _names,
                interval: {start: getTime(subDays(Date.now(), 1)), end: Date.now()},
                period:_period,
            });
        }

        initLoad();
    },[db])
    // Theme Controls
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <div className="weather-station-controls">
            <WeatherToolbar
                db={db}
                names={_names}
                minDate={minDate}
                onSensorToggled={onSensorToggled}
                onSyncToggled={onSyncToggled}
                onSubmit={({interval, period})=>handleDateIntervalSubmitted({names:_names, interval, period})}
            >

            </WeatherToolbar>
            {/*{<CircularProgress color="secondary" size={100} className="progress-loading"/>}*/}
            {isLoading && <CircularProgress color="secondary" size={100} className="progress-loading"/>}
            {/*{<Chart options={_options} series={series} type="line" height="100%" width="100%"/>}*/}
            {!isLoading && <Chart options={_options} series={series} type="line" height="100%" width="100%"/>}
            {isMobile && <WeatherFooter db={db} onSensorToggled={onSensorToggled}/>}
        </div>

    );
}
