'use strict'

require("dotenv").config()
const jwt = require("jsonwebtoken")
const { generate_auth_response } = require("../utils/responses/auth_response.util")

module.exports.verify_token = function (event, context, callback) {
    if (event.authorizationToken) {

        const token_parts = event.authorizationToken.split(" ")
        const token = token_parts[1]

        if (!(token_parts[0]?.toLowerCase() === "bearer" && token)) {
            return callback("Unauthorized")
        }

        try {
            const user = jwt.verify(token, process.env.AUTH_TOKEN_SECRET)
            return callback(
                null,
                generate_auth_response(
                    user,
                    "Allow",
                    event.methodArn
                )
            )
        } catch (error) {
            return callback("Unauthorized")
        }

    } else {
        return callback("Unauthorized")
    }
}