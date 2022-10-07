'use strict'

const mongoose = require("mongoose")
const Post = require("../../model/Post.model")
const User = require("../../model/User.model")
const Comment = require("../../model/Comment.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.delete_comment = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const comment_id = event.pathParameters.comment_id
    const user_id = event.requestContext.authorizer.principalId.id

    return connect_db()
        .then(async () => {
            try {
                const comment = await Comment.findById(comment_id).populate("comment_creator")

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
                        "Could not delete comment. User not found"
                    )

                if (!(comment.comment_creator).equals(user_id))
                    throw new Api_Error(
                        403,
                        "Forbidden to the resource."
                    )

                await comment.deleteOne()

                const post_comment_index = post.comments.findIndex(comment => comment.equals(comment_id))
                post.comments.splice(post_comment_index, 1)
                const user_comment_index = user.comments.findIndex(comment => comment.equals(comment_id))
                user.comments.splice(user_comment_index, 1)

                await post.save()
                await user.save()

                return callback(
                    null,
                    new Api_Response(
                        200,
                        {
                            message: `Successfully deleted the comment with id ${comment_id}`,
                            deleted: true
                        }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        `Could not delete post with id ${comment_id}`
                    )
                )
            }
        })
}