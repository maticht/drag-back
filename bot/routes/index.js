const Router = require('express')
const router = new Router()
const scoreRouter = require("./scoreRouter");

router.use('/score', scoreRouter);


module.exports = router
