const Router = require('express')
const router = new Router()
const web3Controller = require('../controller/web3/web3Controller');

router.post("/", web3Controller.withdraw);

module.exports = router