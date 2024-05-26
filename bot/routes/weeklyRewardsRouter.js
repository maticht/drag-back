const Router = require('express')
const router = new Router()
const weeklyRewardsController = require('../controller/weeklyRewardsController')

router.post('/', weeklyRewardsController.claim);
router.get('/:userId', weeklyRewardsController.checkRewards);


module.exports = router