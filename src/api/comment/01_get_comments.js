'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.get_comments = async function (event, context, callback) {
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

                const post_comments = await post.populate({
                    path: "comments",
                    populate: [
                        {
                            path: "comment_creator",
                            select: "_id username email"
                        },
                        {
                            path: "likes",
                            select: "_id username email"
                        }
                    ]
                })

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            result: post_comments.comments
                        })
                    }
                )
            } catch (error) {
                callback(
                    null,
                    {
                        statusCode: err.statusCode || 500,
                        body: JSON.stringify({
                            message: "Could not fetch post comments",
                            error
                        })
                    }
                )
            }
        })
}