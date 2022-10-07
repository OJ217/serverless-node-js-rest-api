'use strict'

module.exports.generate_auth_response = function (principalId, effect, methodArn) {
    if (!effect || !methodArn) return null

    const policyDocument = {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: effect,
                Resource: methodArn
            }
        ]
    }

    return {
        principalId,
        policyDocument
    }
}