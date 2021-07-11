import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {useEffect, useState} from "react";
import {onWeatherUpdate, getRangeSelection} from "../util/db";
import {subDays} from "date-fns";

function getNames(data) {
    console.debug('SensorToggle => Get Names:', data)
    return Object.keys(data).filter(k => {
        const exclude = ['_id', '_rev', 'timestamp', 'intervals', 'replicates', 'sea_level_pressure']
        return !exclude.includes(k)
    })
}

export function SensorToggle({name, data, onSensorToggled}) {
    console.debug('SensorToggle => Running...');

    const emoji = {
        temperature: "🌡️",
        pressure: "⬇️",
        humidity: "💦",
        gas: "☠️",
        altitude: "🧭",
        sea_level_pressure: "⬇️",
    }
    const _onSensorToggled = (e)=>{
        console.debug('SensorToggle => On Click:', name)
        onSensorToggled(e, name)
    }
    return (
        <Button
            onClick={_onSensorToggled}
            key={name}
            color="inherit"
            variant="text"
        >
            {emoji[name]} {data[name]}
        </Button>
    )
}



export default function SensorToggles({db, onSensorToggled}) {
    console.debug('SensorToggles => Running...')
    /**
     * Latest Data from Changes Feed
     */
    const [data, setData] = useState({
        "temperature": NaN,
        "pressure": NaN,
        "humidity": NaN,
        "gas": NaN,
        "altitude": NaN
    });
    const [realtime] = useState(true)

    useEffect(function weatherEffect(){
        console.debug(`SensorToggles => Database Weather Effect ${subDays(Date.now(), 1).getTime()}`);
        let range = [subDays(Date.now(), 1).getTime(), Date.now()]
        let names = ['temperature', 'pressure', 'humidity', 'gas', 'altitude']
        getRangeSelection({range, names}, (d)=>{
            console.debug('DAATA',d)
            setData({
                "temperature": Math.round(d[0][0].sum/d[0][0].count),
                "pressure": Math.round(d[1][0].sum/d[1][0].count),
                "humidity": Math.round(d[2][0].sum/d[2][0].count),
                "gas": Math.round(d[3][0].sum/d[3][0].count),
                "altitude": Math.round(d[4][0].sum/d[4][0].count)
            })
        })

        return onWeatherUpdate(db, function onLiveChange(c) {
            console.debug(`SensorToggles => Database Update`, c);
            if(realtime || isNaN(data.altitude)){
                console.debug(`SensorToggles => Database Realtime`, c);
                setData(Object.keys(c.doc).reduce((d,key) => {
                    d[key] = Math.round(c.doc[key])
                    return d;
                }, {}));
            }

        })
    }, [db, realtime, data.altitude]);

    const toggles = () => getNames(data).map(
        (name, index) => <SensorToggle
            key={index} name={name} data={data} onSensorToggled={onSensorToggled}
        />)
    return (
        !isNaN(data.altitude) ?
            <ButtonGroup variant="text" color="secondary" aria-label="outlined primary button group">
                {toggles()}
            </ButtonGroup> :
            <CircularProgress color="secondary"/>
    )
}
