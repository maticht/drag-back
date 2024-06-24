const Router = require('express')
const router = new Router()
const energyController = require('../controller/energyController');

router.patch('/', energyController.update);
router.get('/updateBottle/:userId', energyController.updateBottle);
router.get('/addPole', energyController.addPole)



module.exports = router