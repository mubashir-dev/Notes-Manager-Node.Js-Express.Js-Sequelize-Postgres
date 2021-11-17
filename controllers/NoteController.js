const db = require("../models/index");
const Note = db.notes;
const Email_Verification = db.email_verification;
const Op = db.Sequelize.Op;
const httpError = require("http-errors");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/jwt.auth");
const userData = require("../helpers/user");
const {noteSchema, editNoteSchema} = require('../validations/note.validate')
const _ = require('underscore');

exports.addNote = [auth, async (req, res, next) => {
    try {
        const validationResult = noteSchema.validate(req.body, {abortEarly: false});
        if (!_.isEmpty(validationResult.error)) {
            let _errors = [];
            validationResult.error.details.forEach((element) => {
                _errors.push(element.message);
            });
            res.status(422).send({
                errors: _errors
            });
        } else {
            const user = userData.user(req.headers.authorization);
            const note = await Note.create({
                title: req.body.title,
                content: req.body.content,
                user_id: user.id
            })
            res.status(200).send({
                message: "Your note has been saved",
                note: note
            })
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}]

exports.editNote = [auth, async function (req, res, next) {
    try {
        let body = req.body;
        body['id'] = req.params.id;
        const validationResult = editNoteSchema.validate(req.body, {abortEarly: false});
        if (!_.isEmpty(validationResult.error)) {
            let _errors = [];
            validationResult.error.details.forEach((element) => {
                _errors.push(element.message);
            });
            res.status(422).send({
                errors: _errors
            });
        } else {
            const user = userData.user(req.headers.authorization);
            const notefound = await Note.findOne({where: {id: req.params.id, user_id: user.id}});
            if (notefound) {
                const note = await Note.update({
                    title: req.body.title,
                    content: req.body.content,
                }, {where: {id: req.params.id, user_id: user.id}});
                res.status(200).send({
                    message: "Your note has been updated",
                })
            } else {
                res.status(401).send({
                    message: "Your note has not been updated",
                })
            }
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}
]

exports.getNote = [auth, async function (req, res, next) {
    try {
        const user = userData.user(req.headers.authorization);
        const notefound = await Note.findOne({where: {id: req.params.id, user_id: user.id}});
        if (notefound) {
            res.status(200).send({
                note: notefound,
            })
        } else {
            res.status(404).send({
                message: "No Record Found",
            })
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}]
exports.getNotes = [auth, async function (req, res, next) {
    try {
        const user = userData.user(req.headers.authorization);
        const notesfound = await Note.findAll({where: {user_id: user.id}});
        if (notesfound) {
            res.status(200).send({
                notes: notesfound,
            })
        } else {
            res.status(404).send({
                message: "No Record Found",
            })
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}]

exports.deleteNote = [auth, async function (req, res, next) {
    try {
        const user = userData.user(req.headers.authorization);
        const notefound = await Note.findOne({where: {id: req.params.id, user_id: user.id}});
        if (notefound) {
            await Note.destroy({where: {id: req.params.id}});
            res.status(200).send({
                message: "Note has been removed",
            })
        } else {
            res.status(404).send({
                message: "No Record Found",
            })
        }
    } catch (error) {
        next(new httpError(500, {
            message: error.message
        }));
    }
}]