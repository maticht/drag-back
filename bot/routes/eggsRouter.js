const Router = require('express')
const router = new Router()
const eggsController = require('../controller/eggsController')

router.get('/:userId', eggsController.modalFlag);

module.exports = router