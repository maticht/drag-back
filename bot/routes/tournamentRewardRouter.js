const Router = require('express')
const router = new Router()
const tournamentRewardController = require('../controller/tournamentRewardController')

router.post('/', tournamentRewardController.claim);
router.get('/:userId', tournamentRewardController.checkRewards);


module.exports = router