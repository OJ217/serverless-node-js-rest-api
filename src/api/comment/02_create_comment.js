'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const Comment = require("../../model/Comment.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.create_comment = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id
    const user_id = event.requestContext.authorizer.principalId.id

    const { comment_body } = JSON.parse(event.body)

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

                const user = await User.findById(user_id)

                if (!user) {
                    return callback(
                        null,
                        {
                            statusCode: 404,
                            body: JSON.stringify({
                                message: "Could not create comment. User not found",
                                error: true
                            })
                        }
                    )
                }

                const comment = await Comment.create({
                    parent_post: post_id,
                    comment_creator: user_id,
                    comment_body
                })

                post.comments.push(comment._id)
                user.comments.push(comment._id)

                await post.save()
                await user.save()

                return callback(
                    null,
                    {
                        statusCode: 201,
                        body: JSON.stringify({
                            message: "Created comment successfully",
                            result: comment
                        })
                    }
                )

            } catch (error) {
                return callback(
                    null,
                    {
                        statusCode: error.statusCode || 500,
                        body: JSON.stringify({
                            message: "Could not create comment.",
                            error
                        })
                    }
                )
            }
        })
}