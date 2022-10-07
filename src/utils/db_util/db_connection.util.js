'use strict'

require("dotenv").config()
const mongoose = require("mongoose")

let db_connection

module.exports.connect_db = async function () {

    if (db_connection) {
        console.log("=> using existing database connection")
        return Promise.resolve()
    }

    console.log("=> using new database connection")

    return mongoose.connect(process.env.DEV_MONGO_URI)
        .then(db => {
            db_connection = db.connections[0].readyState
        })
        .catch(err => {
            console.err(err)
            process.exit(1)
        })

}