'use strict'

const User = require("../../model/User.model")
const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.create_post = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    const user_id = event.requestContext.authorizer.principalId.id

    const { title, content } = JSON.parse(event.body)

    return connect_db()
        .then(async () => {
            try {
                const user = await User.findById(user_id)

                if (!user) {
                    return callback(
                        null,
                        {
                            statusCode: 404,
                            body: JSON.stringify({
                                message: "Could not create post. User not found",
                                error: true
                            })
                        }
                    )
                }

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
                    {
                        statusCode: 201,
                        body: JSON.stringify({
                            message: "Successfully created new post",
                            result: populated_post
                        })
                    }
                )
            } catch (error) {
                console.log(error)
                return callback(
                    null,
                    {
                        statusCode: error.statusCode || 500,
                        body: JSON.stringify({
                            message: "Could not create the new post",
                            error
                        })
                    }
                )
            }
        })
}