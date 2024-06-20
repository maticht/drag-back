const Router = require("express");
const router = new Router();
const axeController = require("../controller/axeController")

router.get('/upgrade/userId', axeController.upgrade)

module.exports = router;