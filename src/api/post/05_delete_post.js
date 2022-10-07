'use strict'

const mongoose = require("mongoose")
const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.delete_post = function (event, context, callback) {
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
                        "Could not delete post. User not found"
                    )

                if (!((post.creator._id).equals(user_id)))
                    throw new Api_Error(
                        403,
                        "Forbidden to the resource"
                    )

                await post.deleteOne()

                const user_post_index = user.posts.findIndex(index => index.equals(post_id))
                user.posts.splice(user_post_index, 1)

                await user.save()

                return callback(
                    null,
                    new Api_Response(
                        200,
                        {
                            message: `Successfully deleted the post with id ${post_id}`,
                            deleted: true
                        }
                    )
                )
            } catch (error) {
                console.log(error)
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not delete the post"
                    )
                )
            }
        })
}