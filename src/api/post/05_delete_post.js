'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.delete_post = function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id
    const user_id = event.requestContext.authorizer.principalId.id

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id).populate("creator")

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

                if (!((post.creator._id).equals(user_id))) {
                    return callback(
                        null,
                        {
                            statusCode: 403,
                            body: JSON.stringify({
                                message: "Forbidden to the resource",
                                error: true
                            })
                        }
                    )
                }

                await post.deleteOne()

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: `Successfully deleted the post with id ${post_id}`,
                            deleted: true
                        })
                    }
                )
            } catch (error) {
                console.log(error)
                return callback(
                    null,
                    {
                        statusCode: error.statusCode || 500,
                        body: JSON.stringify({
                            message: "Could not delete the post",
                            error
                        })
                    }
                )
            }
        })
}