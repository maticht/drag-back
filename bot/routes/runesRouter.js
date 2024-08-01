const Router = require('express')
const router = new Router()
const runesController = require('../controller/runesController');

router.get("/:userId", runesController.getUserRunes);
router.post("/createRune/", runesController.createRune);
router.get("/", runesController.getAvailableRune);
router.put("/buyRune/:userId", runesController.buyRune);

module.exports = router