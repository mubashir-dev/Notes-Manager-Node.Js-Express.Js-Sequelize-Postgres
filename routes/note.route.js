const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/NoteController')


router.post('/add', NoteController.addNote);
router.put('/edit/:id', NoteController.editNote);
router.get('/', NoteController.getNotes);
router.get('/show/:id', NoteController.getNote);
router.delete('/delete/:id', NoteController.deleteNote);

module.exports = router