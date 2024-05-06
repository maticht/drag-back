const Router = require('express')
const router = new Router()
const scoreRouter = require("./scoreRouter");

router.use('/score', scoreRouter);
router.use('/axe', scoreRouter);
router.use('/barrel', scoreRouter);
router.use('/hammer', scoreRouter);
router.use('/eggs', scoreRouter);
router.use('/boosters', scoreRouter);
router.use('/assistant', scoreRouter);
router.use('/dragons', scoreRouter);
router.use('/users', scoreRouter);



module.exports = router
