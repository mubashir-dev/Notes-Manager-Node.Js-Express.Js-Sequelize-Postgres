const Joi = require('@hapi/joi')

const noteSchema = Joi.object({
    title: Joi.string().min(6).required(),
    content: Joi.string()
        .min(3)
        .required()
})
const editNoteSchema = Joi.object({
    id:Joi.number(),
    title: Joi.string().min(6).required(),
    content: Joi.string()
        .min(3)
        .required()
})

module.exports = {
    noteSchema,
    editNoteSchema
}