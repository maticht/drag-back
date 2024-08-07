const Router = require('express');
const router = new Router();
const scoreRouter = require("./scoreRouter");
const energyRouter = require("./energyRouter");
const weeklyScoreRewardsRouter = require('./weeklyScoreRewardsRouter');
const weeklyReferralRewardsRouter = require('./weeklyReferralRewardsRouter');
const dailyMiniGameRewardsRouter = require('./dailyMiniGameRewardsRouter');
const tournamentRewardRouter = require('./tournamentRewardRouter');
const eggsRouter = require('./eggsRouter');
const userRouter = require('./userRouter');
const axeRouter = require('./axeRouter');
const dailyRewardsRouter = require('./dailyRewardsRouter');
const referralsRouter = require('./referralsRouter');
const barrelRouter = require('./barrelRouter');
const hammerRouter = require('./hammerRouter');
const taskRouter = require("./taskRouter");
const achievementRouter = require("./achievementRouter");
const miniGameRouter = require("./miniGameRouter");
const alphaTesterRouter = require('./alphaTesterRouter');
const runesRouter = require('./runesRouter');

router.use('/score', scoreRouter);
router.use('/axe', axeRouter);
router.use('/barrel', barrelRouter);
router.use('/hammer', hammerRouter);
router.use('/eggs', eggsRouter);
router.use('/boosters', scoreRouter);
router.use('/assistant', scoreRouter);
router.use('/dragons', scoreRouter);
router.use('/users', userRouter);
router.use('/alphaTesters', alphaTesterRouter);
router.use('/energy', energyRouter)
router.use('/weeklyScoreRewards', weeklyScoreRewardsRouter);
router.use('/weeklyReferralRewards', weeklyReferralRewardsRouter);
router.use('/dailyMiniGameRewards', dailyMiniGameRewardsRouter);
router.use('/tournamentRewards', tournamentRewardRouter);
router.use('/dailyRewards', dailyRewardsRouter);
router.use('/referrals', referralsRouter);
router.use('/task', taskRouter);
router.use('/achievement', achievementRouter);
router.use('/miniGame', miniGameRouter);
router.use('/runes', runesRouter);

module.exports = router
