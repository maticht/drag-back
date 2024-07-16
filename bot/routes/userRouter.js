const Router = require("express");
const router = new Router();
const userController = require("../controller/userController");

router.get('/data/:userId', userController.getUserData);
router.post('/data/:userId', userController.getUserDataLoadingScreen);
router.get('/scoreTop/:userId', userController.getAllUsersForScoreTop);
router.get('/referralTop/:userId', userController.getAllUsersForReferralTop);
router.get('/miniGameTop/:userId', userController.getAllUsersForMiniGameTop);
router.patch('/updateScoreAndEnergy', userController.updateScoreAndEnergy);
router.put('/updateWalletHash/:userId', userController.updateWalletHash);
router.put('/updateProfileLevel/:userId', userController.updateProfileLevel);
router.put('/changeLanguage/:userId', userController.changeLanguage);

module.exports = router;