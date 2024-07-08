const Router = require('express')
const router = new Router()
const alphaTesterController = require('../controller/alphaTesterController');

router.get("/:userId", alphaTesterController.get);
router.put("/:userId", alphaTesterController.claim);




module.exports = router