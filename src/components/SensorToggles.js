import './SensorToggles.css';
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {useEffect, useLayoutEffect, useState} from "react";
import {getCurrentData, onUpdate} from "../util/db";

function getNames(data) {
    console.debug('SensorToggle => Get Names:', data)
    return Object.keys(data).filter(k => {
        const exclude = ['_id', '_rev', 'timestamp', 'intervals', 'replicates', 'sea_level_pressure']
        return !exclude.includes(k)
    })
}

export function SensorToggle({state, name, data, onSensorToggled}) {
    console.debug('SensorToggle => Running...');

    const emoji = {
        temperature: "🌡️",
        pressure: "⬇️",
        humidity: "💦",
        gas: "☠️",
        altitude: "🧭",
        sea_level_pressure: "⬇️",
        windSpeed: "💨️",
    }
    const _onSensorToggled = (e)=>{
        console.log('SensorToggle => On Click:', name)
        onSensorToggled(e, name)
    }
    return (
        <Button
            onClick={_onSensorToggled}
            key={name}
            color="inherit"
            className={`action-button-${state}`}
            variant="text"
        >
            {emoji[name]} {data[name]}
        </Button>
    )
}


export default function SensorToggles({db, names, onSensorToggled}) {
    console.debug('SensorToggles => Running...')
    /**
     * Latest Data from Changes Feed
     */
    const [data, setData] = useState({
        "temperature": NaN,
        "pressure": NaN,
        "humidity": NaN,
        "gas": NaN,
        "altitude": NaN,
        "windSpeed": NaN,
    });
    const [realtime] = useState(true)
    useLayoutEffect(()=>{
        async function load(){
            setData(await getCurrentData(db));
        }
        load();
    }, [db])

    useEffect(()=>{
        console.log(`SensorToggles => Database Weather Effect`);

        return onUpdate(db, function onLiveChange(doc) {
            console.log(`SensorToggles => Database Update`, doc);
            if(realtime){
                console.log(`SensorToggles => Database is Realtime, updating....`);
                setData(doc);
            }

        })
    }, [db, realtime]);

    const toggles = () => getNames(data).map(
        (name, index) => <SensorToggle
           state={names.includes(name) ? "enabled" : "disabled"} key={index} name={name} data={data} onSensorToggled={onSensorToggled}
        />)
    return (
        !isNaN(data.altitude) ?
            <ButtonGroup variant="text" color="secondary" aria-label="outlined primary button group">
                {toggles()}
            </ButtonGroup> :
            <CircularProgress color="secondary"/>
    )
}
