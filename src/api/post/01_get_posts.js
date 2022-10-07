'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.get_posts = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    return connect_db()
        .then(async () => {
            try {
                const posts = await Post.find().populate("creator", "_id username email")

                return callback(
                    null,
                    new Api_Response(
                        200,
                        { result: posts }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not fetch posts"
                    )
                )
            }
        })
}