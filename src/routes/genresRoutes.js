const express = require('express');
const router = express.Router();
const {list, getById, getByName} = require('../controllers/genresController');

router
    .get('/', list)
    .get('/name/:name?', getByName)
    .get('/:id', getById);

module.exports = router;