const Router = require('../../core/Router');

const router = new Router({
    prefix: '/assets',
});

router.get('/:id', (req, res, next) => {
    console.log('middleware'); next();
}, (req, res, next) => {
    res.statusCode = 200;
    console.log(req.params);
    res.end('ok '+ req.params.id);
});

module.exports = router;

