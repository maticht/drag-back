const Router = require('express');
const router = new Router();
const miniGameController = require('../controller/miniGameController');

router.get('/:userId', miniGameController.startGame);
router.put('/:userId', miniGameController.receiveGamingReward);

module.exports = router;