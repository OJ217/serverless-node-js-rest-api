'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.get_comments = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.id

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id)

                if (!post)
                    throw new Api_Error(
                        404,
                        `Post with id ${post_id} not found`
                    )

                const post_comments = await post.populate({
                    path: "comments",
                    populate: [
                        {
                            path: "comment_creator",
                            select: "_id username email"
                        }
                    ]
                })

                return callback(
                    null,
                    new Api_Response(
                        200,
                        { result: post_comments.comments }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not fetch post comments"
                    )
                )
            }
        })
}