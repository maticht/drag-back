const Router = require('express')
const router = new Router()
const dailyMiniGameRewardsController = require('../controller/dailyMiniGameRewardsController')

router.post('/', dailyMiniGameRewardsController.claim);
router.get('/:userId', dailyMiniGameRewardsController.checkRewards);


module.exports = router