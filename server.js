const App = require('./core/App');
const routes = require('./api/routes');
const Router = require("./core/Router");
const cookieParser = require("cookie-parser");
require('dotenv').config({path: `.env.${process.env.NODE_ENV}`});
const cors = require("cors");

const app = new App();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(cookieParser());

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))

const mainRoute = new Router();

mainRoute.get('/', (req, res, next) => {
    res.statusCode = 200;
    res.end('ok');
})

app.useRouter(mainRoute);
app.useRouter(routes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    app.stop(() => {
        console.log('Server closed.');
        // Close any other connections or resources here
        process.exit(0);
    });
    // Force close the server after 5 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 5000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);



