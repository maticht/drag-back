const Router = require('express')
const router = new Router()
const dailyRewardsController = require('../controller/dailyRewardsController')

router.get('/check/:userId', dailyRewardsController.checkRewards)
router.put('/collect/:userId', dailyRewardsController.collect);

module.exports = router