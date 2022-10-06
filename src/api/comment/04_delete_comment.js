'use strict'

const mongoose = require("mongoose")
const Post = require("../../model/Post.model")
const User = require("../../model/User.model")
const Comment = require("../../model/Comment.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.delete_comment = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const comment_id = event.pathParameters.comment_id
    const user_id = event.requestContext.authorizer.principalId.id

    return connect_db()
        .then(async () => {
            try {
                const comment = await Comment.findById(comment_id).populate("comment_creator")

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
                                message: "Could not delete the comment. User not found",
                                error: true
                            })
                        }
                    )
                }

                if (!(comment.comment_creator).equals(user_id)) {
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

                const session = await mongoose.startSession()
                session.startTransaction()

                await comment.deleteOne()

                const post_comment_index = post.comments.findIndex(comment => comment === comment_id)
                post.comments.splice(post_comment_index, 1)
                const user_comment_index = user.comments.findIndex(comment => comment === comment_id)
                user.comments.splice(user_comment_index, 1)

                await post.save()
                await user.save()

                session.commitTransaction()

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: `Successfully deleted the comment with id ${comment_id}`,
                            deleted: true
                        })
                    }
                )
            } catch (error) {
                return callback(
                    null,
                    {
                        statusCode: error.statusCode || 500,
                        body: JSON.stringify({
                            message: `Could not delete post with id ${comment_id}`,
                            error
                        })
                    }
                )
            }
        })
}