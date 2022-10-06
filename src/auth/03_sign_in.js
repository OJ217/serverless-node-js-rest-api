'use strict'

const User = require("../model/User.model")
const { connect_db } = require("../utils/db_connection.util")
const { sign_in_validator } = require("../utils/validators/auth.validator")

module.exports.sign_in = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const { email, password } = JSON.parse(event.body)

    return sign_in_validator(email, password)
        .then(() => (
            connect_db()
                .then(async () => {
                    try {
                        const user = await User.findOne({ email }).select("+password")

                        if (user) {
                            const password_match = await user.compare_passwords(password)

                            if (password_match) {
                                const token = user.get_signed_token()

                                return callback(
                                    null,
                                    {
                                        statusCode: 200,
                                        body: JSON.stringify({
                                            message: "Signed in successfully",
                                            result: {
                                                token,
                                                ...user._doc
                                            }
                                        })
                                    }
                                )
                            }

                            return callback(
                                null,
                                {
                                    statusCode: 403,
                                    body: JSON.stringify({
                                        message: "Incorrect password",
                                        error: true
                                    })
                                }
                            )
                        }

                        return callback(
                            null,
                            {
                                statusCode: 404,
                                body: JSON.stringify({
                                    message: "User not found. Sign up first.",
                                    error: true
                                })
                            }
                        )
                    } catch (error) {
                        return callback(
                            null,
                            {
                                statusCode: 404,
                                body: JSON.stringify({
                                    message: "Could not find user.",
                                    error
                                })
                            }
                        )
                    }
                })
        ))
        .catch(error => (
            callback(
                null,
                {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: "Could not sign in. Please provide valid fields.",
                        error
                    })
                }
            )
        ))
}