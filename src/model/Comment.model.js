'use strict'

const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema({
    parent_post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    },
    comment_body: {
        type: String,
        maxlength: [250, "The comment body must have 250 characters at most"],
        required: [true, "Comment body is required"]
    },
    comment_creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
}, { timestamps: true })

const Comment = mongoose.model("comment", CommentSchema)

module.exports = Comment