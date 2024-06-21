const Router = require('express')
const router = new Router()
const scoreRouter = require("./scoreRouter");
const energyRouter = require("./energyRouter");
const weeklyRewardsRouter = require('./weeklyRewardsRouter');
const eggsRouter = require('./eggsRouter')
const userRouter = require('./userRouter')
const axeRouter = require('./axeRouter')
const dailyRewardsRouter = require('./dailyRewardsRouter')
const referralsRouter = require('./referralsRouter')

router.use('/score', scoreRouter);
router.use('/axe', axeRouter);
router.use('/barrel', scoreRouter);
router.use('/hammer', scoreRouter);
router.use('/eggs', eggsRouter);
router.use('/boosters', scoreRouter);
router.use('/assistant', scoreRouter);
router.use('/dragons', scoreRouter);
router.use('/users', userRouter);
router.use('/energy', energyRouter)
router.use('/weeklyRewards', weeklyRewardsRouter);
router.use('/dailyRewards', dailyRewardsRouter);
router.use('/referrals', referralsRouter);


module.exports = router
