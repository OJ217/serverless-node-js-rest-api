'use strict'

const User = require("../model/User.model")
const { connect_db } = require("../utils/db_util/db_connection.util")
const { sign_up_validtor } = require("../utils/validators/auth.validator")
const { Api_Response, Api_Error, Error_Response } = require("../utils/responses/api_response.util")

module.exports.sign_up = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const { username, email, password, confirm_password } = JSON.parse(event.body)

    // User INPUT VALIDTOR
    return sign_up_validtor(username, email, password, confirm_password)
        .then(() => (
            connect_db()
                .then(async () => {
                    const username_equal = await User.findOne({ username })
                    const email_equal = await User.findOne({ email })

                    // DUPLICATION HANDLER
                    if (username_equal || email_equal)
                        throw new Api_Error(
                            400,
                            "Could not sign up",
                            {
                                ...(username_equal && { username: "The email is taken by another user. Try different one." }),
                                ...(email_equal && { email: "The email is taken by another user. Try different one." })
                            }
                        )

                    // CREATE NEW USER
                    try {
                        const user = await User.create({ username, email, password })
                        const token = user.get_signed_token()

                        return callback(
                            null,
                            new Api_Response(
                                201,
                                "Created new user",
                                {
                                    result: {
                                        token,
                                        ...user._doc
                                    }
                                }
                            )
                        )
                    } catch (error) {
                        return callback(
                            null,
                            new Error_Response(
                                error,
                                "Could not create user"
                            )
                        )
                    }
                })
        ))
        .catch(error => {
            callback(
                null,
                new Error_Response(
                    new Api_Error(
                        400,
                        "Could not sign up. Please provide valid fields.",
                        error
                    )
                )
            )
        })
}   