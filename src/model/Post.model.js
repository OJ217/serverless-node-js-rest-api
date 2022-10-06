'use strict'

const mongoose = require('mongoose')
const User = require("../model/User.model")
const Comment = require("../model/Comment.model")

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: [200, "The title must have 200 characters at most"],
        required: [true, "Post title is required"]
    },
    content: {
        type: String,
        maxlength: [1000, "The content must have 1000 characters at most"],
        required: [true, "Post content is required"]
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: User
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Comment
        }
    ]
}, { timestamps: true })

const Post = mongoose.model("post", PostSchema)

module.exports = Post