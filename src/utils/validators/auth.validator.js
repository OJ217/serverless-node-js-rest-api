'use strict'

function sign_up_validtor(username, email, password, confirm_password) {
    let errors = {}

    const emailRgx = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)

    if (!username.trim()) {
        errors.username = "Please provide a username"
    }

    if (!email.trim()) {
        errors.email = "Please provide an email"
    } else if (!emailRgx.test(email)) {
        errors.email = "Please provide a valid email"
    }

    if (!password.trim()) {
        errors.password = "Please add a password"
    } else if (!password.length > 6) {
        errors.password = "Your password must consist of at least 6 characters"
    } else if (confirm_password !== password) {
        errors.confirm_password = "Passwords do not match"
    }

    return new Promise((resolve, reject) => {
        if (Object.keys(errors) < 1) {
            resolve()
        } else {
            reject(errors)
        }
    })
}

function sign_in_validator(email, password) {
    let errors = {}

    if (!email?.trim()) {
        errors.email = "Please provide an email"
    }

    if (!password?.trim()) {
        errors.password = "Please provide a password"
    }

    return new Promise((resolve, reject) => {
        if (Object.keys(errors) < 1) {
            resolve()
        } else {
            reject(errors)
        }
    })
}

module.exports = {
    sign_up_validtor,
    sign_in_validator
}