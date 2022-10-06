'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.get_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id)

                if (!post) {
                    return callback(
                        null,
                        {
                            statusCode: 404,
                            body: JSON.stringify({
                                message: `Post with id ${post_id} not found`,
                                error: true
                            })
                        }
                    )
                }

                const populated_post = await post.populate("creator", "_id username email")

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            result: populated_post
                        })
                    }
                )
            } catch (error) {
                callback(
                    null,
                    {
                        statusCode: err.statusCode || 500,
                        body: JSON.stringify({
                            message: `Could not fetch post with id ${post_id}`,
                            error
                        })
                    }
                )
            }
        })
}