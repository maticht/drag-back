const Router = require('express')
const router = new Router()
const eggsController = require('../controller/eggsController')

router.get('/modalFlag/:userId', eggsController.modalFlag);
router.get('/scene/:userId', eggsController.scene)
router.put('/alchemistUpgrade/:userId', eggsController.alchemistUpgrade);

module.exports = router