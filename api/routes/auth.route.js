const Router = require('../../core/Router');
const AuthController = require('../controllers/auth.controller');

const router = new Router({
    prefix: '/auth',
});

router.get("/init-register", AuthController.initRegister);

router.post("/verify-register", AuthController.verifyRegister);

router.get("/init-auth", AuthController.initAuth);

router.post("/verify-auth", AuthController.verifyAuth);

module.exports = router;
