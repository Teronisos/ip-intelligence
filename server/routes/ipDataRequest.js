const express = require('express');
const router = express.Router();

const ipDataController = require('../controller/ipDataController');


router.get('/:ip', ipDataController.handleData);


module.exports = router;
