const express = require('express');
const multer = require('multer');
const router = express.Router();
const { identifyPlant } = require('../controllers/plantIdentifier');

const upload = multer();

router.post('/', upload.single('image'), identifyPlant);

module.exports = router;
