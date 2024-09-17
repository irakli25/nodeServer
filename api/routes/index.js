const Router = require('../../core/Router');
const healthRouter = require('./health.route');
const assetsRouter = require('./assets.route');
const authRouter = require('./auth.route');

const router = new Router({
    prefix: '/api',
});

router.use(healthRouter.middleware());
router.use(assetsRouter.middleware());
router.use(authRouter.middleware());

module.exports = router;
