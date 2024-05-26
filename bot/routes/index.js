const Router = require('express')
const router = new Router()
const scoreRouter = require("./scoreRouter");
const energyRouter = require("./energyRouter");
const weeklyRewardsRouter = require('./weeklyRewardsRouter');
const eggsRouter = require('./eggsRouter')

router.use('/score', scoreRouter);
router.use('/axe', scoreRouter);
router.use('/barrel', scoreRouter);
router.use('/hammer', scoreRouter);
router.use('/eggs', eggsRouter);
router.use('/boosters', scoreRouter);
router.use('/assistant', scoreRouter);
router.use('/dragons', scoreRouter);
router.use('/users', scoreRouter);
router.use('/energy', energyRouter)
router.use('/weeklyRewards', weeklyRewardsRouter)


module.exports = router
