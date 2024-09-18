const http  = require('http');
const https = require('https');
const fs = require('fs');
const path  = require('path');

class App {
    constructor() {
        this.middlewares = [];
        this.server = null;
        this.router = null;
    }

    use(middleware) {
        this.middlewares.push(middleware);
    }

    useRouter(router) {
        this.router = router;
    }

    // Helper to set cookies
    setCookie(res, name, value, options = {}) {
        let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

        if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
        if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
        if (options.httpOnly) cookie += `; HttpOnly`;
        if (options.secure) cookie += `; Secure`;
        if (options.path) cookie += `; Path=${options.path}`;
        if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;

        res.setHeader('Set-Cookie', [...(res.getHeader('Set-Cookie') || []), cookie]);
    }

    // Helper to clear cookies
    clearCookie(res, name, options = {}) {
        options.expires = new Date(0); // Set the expiry to a past date to invalidate the cookie
        this.setCookie(res, name, '', options); // Set the cookie with an empty value
    }

    // Enhance the response object to add cookie methods
    enhanceResponse(res) {
        res.status = (code) => {
            res.statusCode = code;
            return res; // Return res to allow method chaining
        };

        res.cookie = (name, value, options) => {
            this.setCookie(res, name, value, options);
            return res;
        };

        res.clearCookie = (name, options) => {
            this.clearCookie(res, name, options);
            return res;
        };

        // JSON helper method
        res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
        };

            res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    }

    handler(req, res) {
        // Enhance the response object to add cookie functionality
        this.enhanceResponse(res);

        const middlewares = [...this.middlewares];

        if (this.router) {
            const routeHandlers = this.router.match(req.method, req.url);
            if (routeHandlers) {
                middlewares.push(...routeHandlers);
            }
        }

        const next = () => {
            if (middlewares.length > 0) {
                const middleware = middlewares.shift();
                middleware(req, res, next);
            } else if (!res.writableEnded) {
                res.statusCode = 404;
                res.end('Not Found');
            }
        };

        next();
    }

    listen(port, callback) {
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
            const options = {
                key: fs.readFileSync(path.join(__dirname, 'server.key')),
                cert: fs.readFileSync(path.join(__dirname, 'server.cert'))
            };
            this.server = https.createServer(options, this.handler.bind(this));
        } else {
            this.server = http.createServer(this.handler.bind(this));
        }
        this.server.listen(port, callback);
    }

    stop(callback) {
        if (this.server) {
            this.server.close();
            this.server.closeIdleConnections();
        }
        callback();
    }
}

module.exports = App;
