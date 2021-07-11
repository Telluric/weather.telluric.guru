import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WeatherApp from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import {createDatabase} from "./util/db";

import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

console.debug('Index => Loading...');
const db = createDatabase();
ReactDOM.render(
    <React.StrictMode>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <WeatherApp className="weather-station-app" db={db}/>
        </MuiPickersUtilsProvider>
    </React.StrictMode>,
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
    onUpdate: (registration) => {
        let waitingWorker = registration && registration.waiting;
        waitingWorker && waitingWorker.postMessage({type: 'SKIP_WAITING'})
        waitingWorker && window.location.reload()
    }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
