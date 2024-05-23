const Router = require('express')
const router = new Router()
const energyController = require('../controller/energyController');

router.patch('/', energyController.update);
router.get('/updateBottle/:userId', energyController.updateBottle);



module.exports = router