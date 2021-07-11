import PouchDB from 'pouchdb-browser';
import PouchdbFind from 'pouchdb-find';
import {getTime} from "date-fns";
import axios from 'axios';
console.debug('Database => Loading...')

PouchDB.plugin(PouchdbFind);

const getHostURL = () => `${process.env.REACT_APP_COUCHDB_URL}/`
const getDatabaseURL = () => `${getHostURL()}${process.env.REACT_APP_COUCHDB_DATABASE}/`
const getDatabaseIndex = (name) => {
    if (process.env.REACT_APP_COUCHDB_VIEW) {
        return `${getDatabaseURL()}${process.env.REACT_APP_COUCHDB_VIEW}/${name}/queries`
    } else if (process.env.REACT_APP_COUCHDB_INDEX) {
        return `${getHostURL()}${process.env.REACT_APP_COUCHDB_INDEX}/${name}`
    }
}
/**
 * Singleton Database Instance
 */
let db;
export function createDatabase(){
    console.debug(`Database => Create Database`)
    if(db instanceof PouchDB) return db;
    else return new PouchDB(getDatabaseURL());
}


export function onWeatherUpdate(db, callback) {
    console.debug(`Database => On Weather Update`)
    let changesFeed = db.changes({
        live: true,
        include_docs: true,
        since: 'now',
    }).on('change', (c)=>{
        if(c.id === '_design/weather-station') {
            // setTimeout(()=>{
            //     window.location.reload();
            // }, 10000)

        } else {
            callback(c);
        }
    });
    return function cleanup(){
        console.debug('Database => Cleanup')
        changesFeed.cancel()
    }
}

/**
 * Range Selection Request
 * @param range
 * @param names
 * @param callback
 */
export function getRangeSelection({range, names}, callback){
    console.debug('Database => On Range Selection', range.length)
    let posts = {
        queries: []
    }
    range.forEach((d, i)=>{
        let start = getTime(range[i])
        let end = getTime(range[i+ 1])
        // let end = i === range.length - 1 ? (getTime(range[i-1]) - getTime(range[i])) + getTime(range[i]) : getTime(range[i+1])
        if(isNaN(end)){
            end = getTime(range[i])- getTime(range[i-1]) + getTime(range[i])
            if(isNaN(end)){
                end = Date.now()
            }
        }
        posts.queries.push({
            startkey: getTime(start),
            endkey: getTime(end),
            reduce: true,
            group: true,
            inclusive_end: true,
            group_level: 0,
        })
    })
    // Make a request for a user with a given ID
    console.debug('POSTING!!!!!!!!!!!!!!!!', posts)
    let promises = names.map(name=>{
        return axios.post(getDatabaseIndex(name), posts)
            .then(results)
            // .then(({data}) => data.results.filter(r=>typeof r !== 'undefined' && typeof r.rows !== 'undefined' && r.rows.length !== 0).map(d=>d.rows[0].value))
    })

    Promise.all(promises).then((d)=>{
        console.debug('Database => On Range Selection Result', d)
        callback(d);
    })
}

function results(res){
    // console.debug('REsults!', res)
    // let bill = res.data.results.map(r=>{
    //     if(typeof r !== 'undefined' && typeof r.rows !== 'undefined' && r.rows.length !== 0){
    //         return Math.round(r.rows[0].value)
    //     } else {
    //         return undefined
    //     }
    // })
    // console.debug(bill)
    return res.data.results
        .filter(r=>typeof r !== 'undefined' && typeof r.rows !== 'undefined' && r.rows.length !== 0)
        .map(d=>d.rows[0].value)
}
