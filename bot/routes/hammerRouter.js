const Router = require("express");
const router = new Router();
const hammerController = require("../controller/hammerController")

router.put('/upgrade/:userId', hammerController.upgrade);

module.exports = router;