'use strict'

require("dotenv").config()
const jwt = require("jsonwebtoken")
const { generate_auth_response } = require("../utils/responses/auth_response.util")

module.exports.verify_token = function (event, context, callback) {
    try {

        if (!event.authorizationToken)
            throw new Error("Unauthorized")

        const token_parts = event.authorizationToken.split(" ")
        const token = token_parts[1]

        if (!(token_parts[0]?.toLowerCase() === "bearer" && token))
            throw new Error("Unauthorized")

        const user = jwt.verify(token, process.env.AUTH_TOKEN_SECRET)
        return callback(
            null,
            generate_auth_response(
                user.id,
                "Allow",
            )
        )

    } catch (error) {
        return callback(
            null,
            generate_auth_response(
                "Unauthorized",
                "Deny"
            )
        )

    }
}