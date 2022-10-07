'use strict'

const Post = require("../../model/Post.model")
const User = require("../../model/User.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.like_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id
    const user_id = event.requestContext.authorizer.principalId.id

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id).populate("creator")

                if (!post)
                    throw new Api_Error(
                        404,
                        `Post with id ${post_id} not found`
                    )

                const user = await User.findById(user_id)

                if (!user)
                    throw new Api_Error(
                        404,
                        `Could not like/unlike post. User not found.`
                    )

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
                    new Api_Response(
                        200,
                        {
                            message: like_message,
                            success: true
                        }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        `Could not like/unlike post with id ${post_id}`
                    )
                )
            }
        })
}