'use strict'

const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: [6, "Username password must have 6 characters at least"],
        maxlength: [32, "Username must have 32 characters at most"],
        required: [true, "Username is required"],
        index: true
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
        required: [true, "Email is required"],
        index: true
    },
    password: {
        type: String,
        select: false,
        minlength: [6, "Your password must have 6 characters at least"],
        maxlength: [32, "Your password must have 32 characters at most"],
        required: [true, "Password is required"]
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ],
    liked_posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
}, { timestamps: true })

UserSchema.pre("save", async function (next) {
    if (!(this.isModified("password"))) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)

    next()
})

UserSchema.methods.compare_passwords = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.get_signed_token = function () {
    return jwt.sign(
        { id: this._id },
        process.env.AUTH_TOKEN_SECRET,
        { expiresIn: process.env.AUTH_TOKEN_EXPIRY }
    )
}

const User = mongoose.model("user", UserSchema)

module.exports = User