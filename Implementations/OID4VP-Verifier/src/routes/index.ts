import Router from 'express';
var authRoute = require('./auth');
var verifyRoute = require('./verify');

const router = Router();
router.use('/auth', authRoute);
router.use('/verify', verifyRoute);


module.exports = router;