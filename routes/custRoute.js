const express = require('express');
const router = express.Router();
const {
    custFirstPage,
    checkoutPage,
    order,
    loginPage,
    login
} = require('../controllers/custController');

router.get('/', custFirstPage);
router.post('/checkout', checkoutPage);
router.post('/order', order);
router.get('/login', loginPage);
router.post('/login', login);

module.exports = router;