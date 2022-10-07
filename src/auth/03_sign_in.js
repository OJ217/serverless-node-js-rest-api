'use strict'

const User = require("../model/User.model")
const { connect_db } = require("../utils/db_util/db_connection.util")
const { sign_in_validator } = require("../utils/validators/auth.validator")
const { Api_Response, Api_Error, Error_Response } = require("../utils/responses/api_response.util")

module.exports.sign_in = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const { email, password } = JSON.parse(event.body)

    return sign_in_validator(email, password)
        .then(() => (
            connect_db()
                .then(async () => {
                    try {
                        const user = await User.findOne({ email }).select("+password")

                        if (!user)
                            throw new Api_Error(
                                404,
                                "User not found. Sign up first."
                            )

                        const password_match = await user.compare_passwords(password)

                        if (!password_match)
                            throw new Api_Error(
                                403,
                                "Incorrect password"
                            )

                        const token = user.get_signed_token()

                        return callback(
                            null,
                            new Api_Response(
                                200,
                                {
                                    message: "Signed in successfully",
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
                                "Could not sign in user."
                            )
                        )
                    }
                })
        ))
        .catch(error => (
            callback(
                null,
                new Error_Response(
                    new Api_Error(
                        400,
                        "Could not sign in. Please provide valid fields.",
                        error
                    )
                )
            )
        ))
}