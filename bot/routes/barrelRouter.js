const Router = require("express");
const router = new Router();
const barrelController = require("../controller/barrelController")

router.put('/upgrade/:userId', barrelController.upgrade)
router.put('/collect/:userId', barrelController.collect)
router.put('/expectation/:userId', barrelController.expectation)


module.exports = router