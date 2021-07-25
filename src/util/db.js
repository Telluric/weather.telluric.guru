import PouchDB from 'pouchdb-core';
import PouchHTTP from 'pouchdb-adapter-http'
import PouchIndexDB from 'pouchdb-adapter-indexeddb'
import PouchReplication from 'pouchdb-replication'
import {getTime, subDays, subHours} from "date-fns";
import axios from 'axios';
import {periodIntervalsFromInterval} from "./time";

PouchDB.plugin(PouchHTTP);
PouchDB.plugin(PouchIndexDB);
PouchDB.plugin(PouchReplication);
console.debug('Database => Loading...')


/**
 * Host URL Path
 * This is normally the same as the deployment path for the React SPA.
 * This can be a separate instance/different database target if you
 * set your local env files to target the appropriate endpoints.
 *
 * Host url will always resolve to the root domain and protocol in use.
 * @example
 * // REACT_APP_COUCHDB_URL=https://weather.telluric.guru
 * 'https://weather.telluric.guru/'
 *
 * @type {string}
 */
const HOST_URL = `${process.env.REACT_APP_COUCHDB_URL}/`
/**
 * Couchdb URL Path
 * This can be a rewrite path as long as it resolves to a Couch compatible Database path
 *
 * Database Path will always be relative to the Host URL
 * @example
 * // REACT_APP_COUCHDB_URL=api
 * 'https://weather.telluric.guru/api/'
 *
 * @type {string}
 */
const COUCHDB_URL = `${HOST_URL}${process.env.REACT_APP_COUCHDB_DATABASE}/`

/**
 * Get Database Index
 * Database Index can be a View or a rewrite path as long as it can resolve queries.
 * COUCHDB_VIEW takes precedence over COUCHDB_INDEX and both ar relative to the COUCHDB_URL/HOST_URL
 *
 * @example
 * // REACT_APP_COUCHDB_VIEW='_design/weather-station'
 * // REACT_APP_COUCHDB_INDEX='find'
 * let name = 'temperature';
 * getDatabaseIndex(name);
 * 'https://weather.telluric.guru/api/_design/weather-station/temperature/queries'
 *
 * // REACT_APP_COUCHDB_INDEX='find'
 * getDatabaseIndex(name);
 * 'https://weather.telluric.guru/find/temperature'
 * @param name
 * @returns {string}
 */
const getDatabaseIndex = (name) => {
    if (process.env.REACT_APP_COUCHDB_VIEW) {
        return `${COUCHDB_URL}${process.env.REACT_APP_COUCHDB_VIEW}/${name}/queries`
    } else if (process.env.REACT_APP_COUCHDB_INDEX) {
        return `${HOST_URL}${process.env.REACT_APP_COUCHDB_INDEX}/${name}`
    }
}
/**
 * Singleton Database Instance
 */
let _db;
let _remote;
/**
 * Create Database
 * Configure and return a valid database instance
 * @returns {PouchDB}
 */
export function createDatabase() {
    console.debug(`Database => Create Database`)
    if (_db instanceof PouchDB) return _db;
    else {
        // _remote = new PouchDB(COUCHDB_URL)
        _db = new PouchDB(COUCHDB_URL)
        // _db = new PouchDB('weather');
        // console.log(_db);
        // _db.sync(_remote, {
        //     live: true,
        //     retry: true
        // }).on('change', function (change) {
        //     console.log('Sync Change', change)
        //     // yo, something changed!
        // }).on('paused', function (info) {
        //     console.log('Sync Paused', info)
        //     // replication was paused, usually because of a lost connection
        // }).on('active', function (info) {
        //     console.log('Sync ACtive', info)
        //     // replication was resumed
        // }).on('error', function (err) {
        //     console.log('Sync Err', err)
        //     // totally unhandled error (shouldn't happen)
        // });
        return _db
    }
}

/**
 * Interval To Query
 * Convert an interval to a Query
 *
 * @param start
 * @param end
 * @returns {{reduce: boolean, startkey: number, group_level: number, endkey: number, inclusive_end: boolean, group: boolean}}
 */
const toQuery = ({start, end}) => ({
    startkey: getTime(start),
    endkey: getTime(end),
    reduce: true,
    group: true,
    inclusive_end: false,
    group_level: 0,
})

/**
 * Batch Queries for CouchDB
 *
 * @param name
 * @param queries
 * @returns {Promise<AxiosResponse<any>>}
 */
const batchQuery = ({name, queries}) => axios.post(getDatabaseIndex(name), {queries})
    .then(({status, statusText, data }) => {
        if (status !== 200 && statusText !== 'OK')
            throw new Error('Failed to fetch data');
        else if (data.results && data.results.length > 0)
            return data.results.map(result => result.rows.length > 0 ? result.rows[0].value : undefined)
    })

/**
 * Map Intervals to Queries
 * @param intervals
 */
const intervalsToQueries = (intervals) => intervals.map(toQuery);

/**
 * Round numbers
 * @param i
 * @returns {number}
 */
const r = (i) => Math.round(i * 100) / 100

/**
 * OHLC Chart Data Reducer
 * @param data
 * @param series
 * @param name
 * @param index
 * @param keys
 * @returns {*}
 */
const reduceToChart = ({data, series, name, index, keys}) => {
    series[index] = {
        name,
        // type: 'candlestick',
        data: typeof data[index] !== 'undefined' ? data[index].reduce((records, v, i) => {
            if (typeof v === 'undefined') {
                records.push({x: keys[i], y: [undefined, undefined, undefined, undefined]})
            } else {
                records.push({x: keys[i], y: [v.o, v.h, v.l, v.c].map(r)})
            }
            return records
        }, []) : []


    }
    return series;
}

/**
 * Request Data
 * Send a names list, interval and period to split on and it will return the records index by
 * the names list.
 *
 * @param names
 * @param period
 * @param interval
 * @returns {Promise<*>}
 */
export async function request({names, period, interval}) {
    if (!(_db instanceof PouchDB)) throw new Error('No database connection')
    //TODO: Store state of mindate
    if (interval.start < await findMinStartDate(_db)) throw new Error('Date is out of bounds')

    let {keys, intervals} = periodIntervalsFromInterval(period, interval)
    return Promise.all(
        names.map(name => batchQuery({
            name,
            queries: intervalsToQueries(intervals)
        }))
    ).then(data =>
        names.reduce(
            (series, name, index) =>
                reduceToChart({data, series, name, index, keys}),
            []
        ))
}

const _names = ['temperature', 'pressure', 'humidity', 'gas', 'altitude', 'windSpeed']

/**
 * Beatify Document
 * Check valid keys and round values to 2 decimal places
 *
 * @param d
 * @returns {{}}
 */
const beautifyDoc = (d) => Object.keys(d).reduce((red, n) => {
    if (_names.includes(n)) red[n] = r(d[n])
    return red;
}, {})

/**
 * Get Current Data
 * Returns the latest values from the Database
 * @param db
 * @returns {*}
 */
export function getCurrentData(db) {
    console.log('Getting Current Data')
    let opts = {
        startkey: Date.now().toString(),
        endkey: getTime(subHours(Date.now(), 1)).toString(),
        limit: 1, descending: true, include_docs: true
    }
    console.log(opts)
    return db.allDocs(opts).then(({rows}) => {
        console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',rows)
        if (!rows || !rows.length || rows.length === 0) throw new Error('No data found!');
        return beautifyDoc(rows[0].doc);
    })
}

/**
 * Find Minimum Start Data
 * Returns the oldest date found in the Database
 * @param db
 * @returns {*}
 */
export function findMinStartDate(db) {
    return db.allDocs({limit: 1, sort: 'desc'}).then(({rows}) => {
        if (!rows || !rows.length || rows.length === 0) throw new Error('No data found!');
        return parseInt(rows[0].id);
    })

}

/**
 * On Database Updates
 * Changes feed for Couchdb
 * @param db
 * @param callback
 * @returns {(function(): void)|*}
 */
export function onUpdate(db, callback) {
    console.debug(`Database => On Weather Update`)
    let changesFeed = db.changes({
        live: true,
        include_docs: true,
        since: 'now',
    }).on('change', (c) => {
        console.log('Database => has Changes')
        if (c.id === '_design/weather-station') {
        } else {
            callback(beautifyDoc(c.doc));
        }
    });

    /**
     * Return Cleanup Function for React UseEffects
     */
    return function cleanup() {
        console.debug('Database => Cleanup')
        changesFeed.cancel()
    }
}

