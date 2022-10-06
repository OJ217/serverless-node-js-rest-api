'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.update_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const post_id = event.pathParameters.post_id
    const user_id = event.requestContext.authorizer.principalId.id
    const { title, content } = JSON.parse(event.body)

    return connect_db()
        .then(async () => {
            try {
                const post = await Post.findById(post_id).populate("creator")

                if (!((post.creator._id).equals(user_id))) {
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

                post.title = title
                post.content = content

                const updated_post = await post.save()

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: "Updated post Successfully",
                            result: updated_post
                        })
                    }
                )
            } catch (error) {
                return (
                    null,
                    {
                        statusCode: error.statusCode || 500,
                        body: JSON.stringify({
                            message: "Could not update the post",
                            error
                        })
                    }
                )
            }
        })
}