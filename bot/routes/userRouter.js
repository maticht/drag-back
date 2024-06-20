const Router = require("express");
const router = new Router();
const userController = require("../controller/userController");

router.get('/data/:userId', userController.getUserData);
router.get('/all', userController.getAllUsers);
router.get('/topPlace/:userId', userController.getUserTopPlace);
router.put('/updateWalletHash/:userId', userController.updateWalletHash)



module.exports = router;
