const db = require("../models/index");
const User = db.users;
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
            res.status(200).send({
                message: 'The user has been created successfully',
                user: {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
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
//logout user
exports.logout = []