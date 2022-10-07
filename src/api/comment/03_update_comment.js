'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const Comment = require("../../model/Comment.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.update_comment = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const comment_id = event.pathParameters.comment_id
    const user_id = event.requestContext.authorizer.principalId.id

    const { comment_body } = JSON.parse(event.body)

    return connect_db()
        .then(async () => {
            try {
                const comment = await Comment.findById(comment_id)

                if (!comment)
                    throw new Api_Error(
                        404,
                        `Comment with id ${comment_id} not found`
                    )

                const post = await Post.findById(comment.parent_post).populate("comments")

                if (!post)
                    throw new Api_Error(
                        404,
                        `Post with id ${post_id} not found`
                    )

                const user = await User.findById(user_id)

                if (!user)
                    throw new Api_Error(
                        404,
                        "Could not update comment. User not found"
                    )

                comment.comment_body = comment_body
                await comment.save()

                return callback(
                    null,
                    new Api_Response(
                        200,
                        {
                            message: `Updated comment with id ${comment_id} successfully`,
                            updated: true
                        }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not update the comment."
                    )
                )
            }
        })
}