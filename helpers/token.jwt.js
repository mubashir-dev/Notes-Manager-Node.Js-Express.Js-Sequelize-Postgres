const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const jwt = require("jsonwebtoken");
const httpError = require("http-errors");
require("dotenv").config()

module.exports = {
    signAccessToken: (user) => {
        return new Promise((resolve, reject) => {
            const jwtPayload = user;
            const options = {
                expiresIn: process.env.JWT_TIMEOUT_DURATION,
                issuer: 'NotesManager.org',
            };
            jwt.sign(jwtPayload, process.env.JWT_SECRET, options, (error, token) => {
                if (error) {
                    console.log(error.message)
                    reject("JWT token has not been issued");
                    return;
                }
                resolve(token);
            });
        });

    },
    signARefreshToken: (user) => {
        return new Promise((resolve, reject) => {
            const jwtPayload = user;
            const options = {
                expiresIn: process.env.JWT_REFRESH_DURATION,
                issuer: 'NotesManager.org',
            };
            jwt.sign(jwtPayload, process.env.JWT_REFRESH_SECRET, options, (error, token) => {
                if (error) {
                    console.log(error.message)
                    reject("JWT token has not been issued");
                    return;
                }
                resolve(token);
            });
        });

    },
}



