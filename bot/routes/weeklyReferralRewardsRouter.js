const Router = require('express')
const router = new Router()
const weeklyReferralRewardsController = require('../controller/weeklyReferralRewardsController')

router.post('/', weeklyReferralRewardsController.claim);
router.get('/:userId', weeklyReferralRewardsController.checkRewards);


module.exports = router