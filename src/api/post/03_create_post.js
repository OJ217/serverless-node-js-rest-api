'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.create_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const user_id = event.requestContext.authorizer.principalId.id

    const { title, content } = JSON.parse(event.body)

    return connect_db()
        .then(async () => {
            try {
                const user = await User.findById(user_id)

                if (!user)
                    throw new Api_Error(
                        404,
                        "Could not create post. User not found"
                    )

                const post = await Post.create({
                    title,
                    content,
                    creator: user_id
                })

                user.posts.push(post._id)
                await user.save()

                const populated_post = await post.populate("creator", "_id username email")

                return callback(
                    null,
                    new Api_Response(
                        201,
                        {
                            message: "Successfully created new post",
                            result: populated_post
                        }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not create the new post"
                    ),
                )
            }
        })
}