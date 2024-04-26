const Router = require('express')
const router = new Router()
const scoreController = require('../controller/scoreController')

router.patch('/', scoreController.update);


module.exports = router