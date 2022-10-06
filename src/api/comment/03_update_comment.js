'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const Comment = require("../../model/Comment.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.update_comment = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const comment_id = event.pathParameters.comment_id
    const user_id = event.requestContext.authorizer.principalId.id

    const { comment_body } = JSON.parse(event.body)

    return connect_db()
        .then(async () => {
            try {
                const comment = await Comment.findById(comment_id)

                if (!comment) {
                    return callback(
                        null,
                        {
                            statusCode: 404,
                            body: JSON.stringify({
                                message: `Comment with id ${comment_id} not found`,
                                error: true
                            })
                        }
                    )
                }

                const post = await Post.findById(comment.parent_post).populate("comments")

                console.log({ post_id: comment.parent_post, post })

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

                const user = await User.findById(user_id)

                if (!user) {
                    return callback(
                        null,
                        {
                            statusCode: 404,
                            body: JSON.stringify({
                                message: "Could not update comment. User not found",
                                error: true
                            })
                        }
                    )
                }

                comment.comment_body = comment_body
                await comment.save()

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: `Updated comment with id ${comment_id} successfully`,
                            updated: true
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
                            message: "Could not update the comment.",
                            error
                        })
                    }
                )
            }
        })
}