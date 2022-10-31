'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const Comment = require("../../model/Comment.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.create_comment = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.id
    const user_id = JSON.parse(event.requestContext.authorizer.user_id)

    const { comment_body } = JSON.parse(event.body)

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id)

                if (!post)
                    throw new Api_Error(
                        404,
                        `Post with id ${post_id} not found`
                    )

                const user = await User.findById(user_id)

                if (!user)
                    throw new Api_Error(
                        404,
                        "Could not create comment. User not found"
                    )

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
                    new Api_Response(
                        201,
                        {
                            message: "Created comment successfully",
                            result: comment
                        }
                    )
                )

            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not create comment."
                    )
                )
            }
        })
}