'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.get_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id)

                if (!post)
                    throw new Api_Error(
                        404,
                        `Post with id ${post_id} not found`
                    )

                const populated_post = await post.populate("creator", "_id username email")

                return callback(
                    null,
                    new Api_Response(
                        200,
                        { result: populated_post }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        `Could not fetch post with id ${post_id}`
                    )
                )
            }
        })
}