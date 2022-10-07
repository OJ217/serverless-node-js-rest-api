'use strict'

class Api_Response {
    constructor(statusCode, body) {
        this.statusCode = statusCode
        this.body = JSON.stringify(body)
    }
}

class Api_Error {
    constructor(statusCode, message, body) {
        Object.assign(this, { statusCode, message })
        this.body = body ?? true
    }
}

class Error_Response {
    constructor(error, default_message) {
        this.statusCode = error.statusCode || 500
        this.body = JSON.stringify({
            message: (error instanceof Api_Error) ? error.message : default_message,
            error: error.body || error
        })
    }
}

module.exports = { Api_Response, Api_Error, Error_Response }