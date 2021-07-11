require('dotenv').config({path: './.env.local'})
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const glob = require("glob");
const PouchDB = require('pouchdb-core');
PouchDB.plugin(require('pouchdb-adapter-http'));
let db = new PouchDB(`${process.env.REACT_APP_COUCHDB_URL}/${process.env.REACT_APP_COUCHDB_DATABASE}`);

glob('./build/**/*', async (err, res) => {
    let files = res.filter((file) => !fs.lstatSync(file).isDirectory())
    let dirs = res.filter((file) => fs.lstatSync(file).isDirectory())

    // Build the rewrites file list
    let rewrites = files
        .filter(file => {
            return dirs.filter((d)=>file.match(d)).length === 0
        })
        .map((file) => {
            let fstring = `/${file.replace('./build/', '')}`
            return {
                "from": fstring,
                "to": fstring,
            }
        })

    // Prepend the Index Files
    rewrites.unshift({
        "from": "/",
        "to": "/index.html"
    })

    // Rewrite Folders
    rewrites.push(...dirs.map(d=>{
        let dstring = `/${d.replace('./build/', '')}/*`
        return {
            "from": dstring,
            "to": dstring,
        }
    }))
// Add the Database Rewrite
    rewrites.push( {
        "from": "/api/*",
        "to": "../../*"
    })
    // http://weather.telluric.guru/api/_design/crunch/_view/${name}/queries
    // Add the Database Rewrite
    rewrites.push( {
        "from": "/find/:name",
        "to": "/_view/:name/queries",
        "method": "POST",
    })

    console.log(rewrites);

    let ddoc = await db.get('_design/weather-station')
    db.put({
        _id: '_design/weather-station',
        _rev: ddoc._rev,
        validate_doc_update: function(newDoc, oldDoc, userCtx) {
            var role = "blogger";
            if (userCtx.roles.indexOf("_admin") === -1 && userCtx.roles.indexOf(role) === -1) {
                throw({forbidden : "Only users with role " + role + " or an admin can modify this database."});
            }
        }.toString(),
        views: require('./views'),
        rewrites: rewrites,
        _attachments: files.reduce((attachments, file) => {
            attachments[file.replace('./build/', '')] = {
                content_type: mime.getType(file),
                data: fs.readFileSync(file)
            }
            return attachments
        }, {})
    }).catch(err=>{
        console.log(err);
    })
});

