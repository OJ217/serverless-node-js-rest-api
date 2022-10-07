'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_util/db_connection.util")
const { Api_Response, Api_Error, Error_Response } = require("../../utils/responses/api_response.util")

module.exports.update_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id
    const user_id = JSON.parse(event.requestContext.authorizer.user_id)
    const { title, content } = JSON.parse(event.body)

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
                        "Forbidden to te resource"
                    )

                post.title = title
                post.content = content

                const updated_post = await post.save()

                return callback(
                    null,
                    new Api_Response(
                        200,
                        {
                            message: "Updated post Successfully",
                            result: updated_post
                        }
                    )
                )
            } catch (error) {
                return callback(
                    null,
                    new Error_Response(
                        error,
                        "Could not update the post"
                    )
                )
            }
        })
}