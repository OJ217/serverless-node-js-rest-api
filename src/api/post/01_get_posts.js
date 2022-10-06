'use strict'

const Post = require("../../model/Post.model")
const { connect_db } = require("../../utils/db_connection.util")

module.exports.get_posts = async function (event, context, callback) {
    context.callbackWaitsForEmptyEventLoop = false

    return connect_db()
        .then(async () => {
            try {
                const posts = await Post.find().populate("creator", "_id username email")

                return callback(
                    null,
                    {
                        statusCode: 200,
                        body: JSON.stringify({
                            result: posts
                        })
                    }
                )
            } catch (error) {
                callback(
                    null,
                    {
                        statusCode: err.statusCode || 500,
                        body: JSON.stringify({
                            message: "Could not fetch posts",
                            error
                        })
                    }
                )
            }
        })
}