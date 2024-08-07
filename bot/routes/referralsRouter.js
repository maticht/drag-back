const Router = require("express");
const router = new Router();
const referralsController = require("../controller/referralsController")

router.put('/collect/:userId', referralsController.collect);
router.put('/collectNewReferralsRewards/:userId', referralsController.collectFromNewReferrals);
router.put('/replenishment/:userId', referralsController.replenishment);

module.exports = router;