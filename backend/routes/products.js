const express = require('express');
const router = express.Router();
const products = require('../controllers/products');


// sending products json
router.get('/', products.index);


router.get('/:id', products.show);


module.exports = router;
