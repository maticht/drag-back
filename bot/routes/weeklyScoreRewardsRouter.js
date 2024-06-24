const Router = require('express')
const router = new Router()
const weeklyScoreRewardsController = require('../controller/weeklyScoreRewardsController')

router.post('/', weeklyScoreRewardsController.claim);
router.get('/:userId', weeklyScoreRewardsController.checkRewards);


module.exports = router