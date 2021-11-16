const db = require("../models/index");
const User = db.users;
const Email_Verification = db.email_verification;
const Op = db.Sequelize.Op;
const httpError = require("http-errors");
const passwordHash = require("../helpers/password.hash");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const {authRegisterSchema, LoginSchema, authEditSchema, ChangePasswordSchema} = require('../validations/auth.validate')
const _ = require('underscore');
const {UserUpload} = require('../config/storage');
const {signAccessToken, signARefreshToken} = require("../helpers/token.jwt");
const {transport} = require("../helpers/mail.settings");

exports.register = async (req, res, next) => {
    try {
        console.log(db.users)
        const validationResult = authRegisterSchema.validate(req.body, {abortEarly: false});
        if (!_.isEmpty(validationResult.error)) {
            let _errors = [];
            validationResult.error.details.forEach((element) => {
                _errors.push(element.message);
            });
            res.status(422).send({
                errors: _errors
            });
        } else {
            const emailExist = await User.findOne({where: {email: req.body.email}})
            const usernameExist = await User.findOne({where: {username: req.body.username}})
            if (emailExist)
                next(new httpError(422, {
                    message: `This ${req.body.email} email is already been registered`
                }));
            if (usernameExist)
                next(new httpError(422, {
                    message: `This ${req.body.username} username is already been registered`
                }));
            let hash = await passwordHash.hash(req.body.password);
            const user = await User.create({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                password: hash
            })
            const token = Math.random().toString(16).slice(5);
            Email_Verification.create({
                email: user.email,
                token: token
            })
            //Send Email to User
            var mailOptions = {
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_NAME}>`,
                to: `${user.email}`,
                subject: 'Thanks for Registering with Us',
                text: 'Thanks for choosing us for you daily notes',
                html: '<b>Hello Dear! </b><br> Thanks for choosing us for you daily notes<br/>',
            };

            transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Email has Sent: %s', info.messageId);
            });
            //Verification Email
            var mailOptions = {
                from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM_ADDRESS}>`,
                to: `${user.email}`,
                subject: 'Verify Your Email',
                text: 'Verify your email and get most from Notes Manager',
                html: `<button><a href="http://localhost:3000/auth/verify?token=${token}">Verify Email</a></button>`,
            };

            transport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Email has Sent: %s', info.messageId);
            });
            res.status(200).send({
                message: "Your Account has successfully been created,Kindly Verify Your Email Account"
            })
        }

    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
exports.addProfileImage = [
    auth,
    async (req, res, next) => {
        try {
            if (!req.file) {
                next(new httpError(422, {
                    message: "Select Profile Image"
                }));
            } else {
                const user = userData.user(req.headers.authorization);
                try {
                    UserUpload.single('image')
                } catch (err) {
                    console.log("Error has occurred while uploading Profile Image");
                }
                const userExist = await User.findByPk(user.id)
                if (userExist) {
                    const result = await User.update(
                        {image: '/users/' + req.file.filename},
                        {where: {id: user.id}}
                    );
                    res.status(200).send({
                        user: result,
                        message: "User Profile Image has been Added"
                    });
                } else {
                    res.status(404).send({
                        message: "User has not found"
                    });
                }
            }

        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
]
exports.login = async (req, res, next) => {
    try {
        const validationResult = LoginSchema.validate(req.body, {abortEarly: false});
        if (!_.isEmpty(validationResult.error)) {
            let _errors = [];
            validationResult.error.details.forEach((element) => {
                _errors.push(element.message);
            });
            res.status(422).send({
                errors: _errors
            });
        } else {
            const foundUser = await User.findOne({where: {email: req.body.email}})
            if (!foundUser) {
                next(new httpError(404, 'User is not found in our system'));
            }
            if (foundUser.email_verified) {
                //Compare password
                let hashCompare = await passwordHash.compare(req.body.password, foundUser.password);

                if (hashCompare) {
                    let userData = {
                        id: foundUser.id,
                        name: foundUser.name,
                        email: foundUser.email,
                        username: foundUser.username,
                        image: (foundUser.image == null) ? "" : req.get('Host') + foundUser.image,
                    };
                    //Get Access and Refresh token
                    const accessToken = await signAccessToken(userData);
                    const refreshToken = await signARefreshToken(userData);
                    res.status(200).send({
                        message: "Successfully Logged-In",
                        token_type: 'Bearer',
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        expiresIn: process.env.JWT_TIMEOUT_DURATION,
                        user: userData
                    })
                }
            } else {
                res.status(200).send({
                    message: "Your Account has not verified"
                })
            }
            next(new httpError(401, {
                message: "Password or Email is not Correct"
            }));
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
exports.update = [auth,
    async (req, res, next) => {
        try {
            const validationResult = authEditSchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else {
                const emailExist = await User.findOne({where: {email: req.body.email}})
                const usernameExist = await User.findOne({where: {username: req.body.username}})
                if (emailExist)
                    next(new httpError(422, {
                        message: `This ${req.body.email} email is already been registered`
                    }));
                if (usernameExist)
                    next(new httpError(422, {
                        message: `This ${req.body.username} username is already been registered`
                    }));
                const user = userData.user(req.headers.authorization);
                let result = await User.update({
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email
                }, {where: {id: user.id}});
                res.status(200).send({
                    message: "Your Profile has been Updated"
                });
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
exports.changePassword = [auth,
    async (req, res, next) => {
        try {
            const validationResult = ChangePasswordSchema.validate(req.body, {abortEarly: false});
            if (!_.isEmpty(validationResult.error)) {
                let _errors = [];
                validationResult.error.details.forEach((element) => {
                    _errors.push(element.message);
                });
                res.status(422).send({
                    errors: _errors
                });
            } else {
                const auth_user = userData.user(req.headers.authorization);
                const user = await User.findByPk(auth_user.id);
                const isEligible = await passwordHash.compare(req.body.currentPassword, user.password);
                if (isEligible) {
                    let hash = await passwordHash.hash(req.body.password);
                    let user = await User.update({
                        password: hash
                    }, {
                        where: {id: auth_user.id}
                    });
                    res.status(200).send({
                        message: "Your password has been updated"
                    });
                } else {
                    res.status(401).send({
                        message: "Your password has not updated"
                    });
                }
            }
        } catch (error) {
            next(new httpError(500, {
                message: error.message
            }));
        }
    }
];
exports.verify = async function (req, res) {
    const emailVerification = await Email_Verification.findOne({
        where: {token: req.query.token}
    });
    console.log(emailVerification)
    if (emailVerification) {
        await User.update({email_verified: true}, {where: {email: emailVerification.email}});
        await Email_Verification.destroy({
            where: {token: emailVerification.token}
        })
        res.status(200).send({
            message: "Account has been verified"
        })
    } else {
        res.status(200).send({
            message: "Account has already been verified"
        })
    }
}
//logout user
exports.logout = []