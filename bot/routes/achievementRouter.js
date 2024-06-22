const Router = require('express')
const router = new Router()
const achievementsController = require('../controller/achievementsController');

router.get("/:userId", achievementsController.getAchievements);
router.post("/", achievementsController.createAchievements);
router.put("/:userId", achievementsController.completeAchievement);




module.exports = router