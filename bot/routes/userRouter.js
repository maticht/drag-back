const Router = require("express");
const router = new Router();
const userController = require("../controller/userController");

router.get('/data/:userId', userController.getUserData);
router.get('/scoreTop/:userId', userController.getAllUsersForScoreTop);
router.get('/referralTop/:userId', userController.getAllUsersForReferralTop);
router.put('/updateWalletHash/:userId', userController.updateWalletHash)
router.put('/updateProfileLevel/:userId', userController.updateProfileLevel)

module.exports = router;