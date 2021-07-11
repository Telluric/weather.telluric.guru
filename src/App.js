import './App.css';
import {useEffect, useState, Fragment} from "react";
import {WeatherFooter, WeatherToolbar} from "./components/Controls";
import Chart from 'react-apexcharts'
import {getRangeSelection} from "./util/db";
import {eachPeriodOfInterval} from "./util/time";
import {getTime, subDays} from "date-fns";

import {CircularProgress, Button} from "@material-ui/core";
import {useTheme} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import * as serviceWorker from "./serviceWorkerRegistration";
import * as ApexCharts from "apexcharts";
console.debug('App => Loading...')


/**
 * Two Axes Weather Chart
 * @param db
 * @param options
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


    // STUB for Sensors
    const onSensorToggled = () => console.log;
    // STUB for Realtime Toggle
    const onSyncToggled = () => console.log;

    // Theme Controls
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <div className="weather-station-controls">
            <WeatherToolbar
                db={db}
                onSensorToggled={onSensorToggled}
                onSyncToggled={onSyncToggled}
                onSubmit={onDateRangeSubmitted}
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
