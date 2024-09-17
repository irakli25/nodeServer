const Router = require('../../core/Router');

const router = new Router({
    prefix: '/health',
});

router.get('/check', (req, res, next) => {
    console.log('middleware')
    next();
}, (req, res, next) => {
    res.statusCode = 200;
    res.end('ok');
});

module.exports = router;
