'use strict'

const { default: mongoose } = require("mongoose")
const Post = require("../../model/Post.model")
const User = require("../../model/User.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.like_post = async function (event, context, callback) {
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

                const user = await User.findById(user_id)

                if (!user) {
                    return callback(
                        null,
                        {
                            statusCode: 404,
                            body: JSON.stringify({
                                message: `Could not like/unlike post. User not found.`,
                                error: true
                            })
                        }
                    )
                }

                let like_message

                const post_like_index = post.likes.findIndex(like_id => like_id.equals(user_id))
                const user_like_index = user.liked_posts.findIndex(like_id => like_id.equals(post_id))

                if ((post_like_index === -1) && (user_like_index === -1)) {
                    post.likes.push(user_id)
                    user.liked_posts.push(post_id)
                    like_message = `Liked post with id ${post_id} successfully`
                } else {
                    post.likes.splice(post_like_index, 1)
                    user.liked_posts.splice(user_like_index, 1)
                    like_message = `Unliked post with id ${post_id} successfully`
                }

                await post.save()
                await user.save()

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: like_message,
                            success: true
                        })
                    }
                )
            } catch (error) {
                callback(
                    null,
                    {
                        statusCode: error.statusCode || 500,
                        body: JSON.stringify({
                            message: `Could not like/unlike post with id ${post_id}`,
                            error
                        })
                    }
                )
            }
        })
}