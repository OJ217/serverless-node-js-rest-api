'use strict'

module.exports.generate_auth_response = function (user_id, effect) {
    if (!effect) return null

    const policyDocument = {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: effect,
                Resource: "*"
            }
        ],

    }

    return {
        principalId: user_id,
        policyDocument,
        context: {
            user_id: JSON.stringify(user_id)
        }
    }
}