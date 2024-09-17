class Router {
    constructor({ prefix = '' } = {}) {
        this.routes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
        this.prefix = prefix;
        this.middlewares = [];
    }

    use(routes) {
        for (const method in routes) {
            if (!this.routes[method]) {
                this.routes[method] = {};
            }

            for (const path in routes[method]) {
                const fullPath = this.prefix + path;
                if (!this.routes[method][fullPath]) {
                    this.routes[method][fullPath] = [];
                }
                this.routes[method][fullPath].push(...routes[method][path]);
            }
        }
    }

    get(path, ...handlers) {
        const regex = /\/:([^\/]+)$/;
        const match = path.match(regex);
        if (match) {
            handlers.unshift((req, res, next) => {
                req.params = req.params || {};
                req.params[match[1]] = req.url.split('/').pop();
                next();
            });
        }
        this.routes.GET[this.prefix + path] = handlers;
    }

    post(path, ...handlers) {
        this.routes.POST[this.prefix + path] = handlers;
    }

    put(path, ...handlers) {
        this.routes.PUT[this.prefix + path] = handlers;
    }

    delete(path, ...handlers) {
        this.routes.DELETE[this.prefix + path] = handlers;
    }

    // Helper to parse the request body for POST and PUT requests
    parseBody(req, callback) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(body); // Attempt to parse the body as JSON
            } catch (error) {
                req.body = body; // If not JSON, return the raw body string
            }
            callback();
        });
    }

    match(method, url) {
        // Separate the path and query string
        const [pathWithoutQuery, queryString] = url.split('?');
        const routes = this.routes[method] || {};
        const keys = Object.keys(routes);
        let params = {};
        let query = {};
        // Parse the query string into an object
        if (queryString) {
            query = Object.fromEntries(new URLSearchParams(queryString));
        }

        for (const path of keys) {
            const regex = new RegExp(
                '^' +
                path
                    .replace(/:[^\s/]+/g, '([^\\s/]+)') // Replace :param with capture group
                    .replace(/\//g, '\\/') + // Escape forward slashes
                '$'
            );
            const match = pathWithoutQuery.match(regex);
            if (match) {
                const paramNames = path.match(/:[^\s/]+/g) || [];
                paramNames.forEach((name, index) => {
                    params[name.slice(1)] = match[index + 1];
                });
                return [(req, res, next) => {
                    req.params = params;
                    req.query = query; // Add query parameters to req.query

                    // If method is POST or PUT, parse the body
                    if (method === 'POST' || method === 'PUT') {
                        this.parseBody(req, next);
                    } else {
                        next();
                    }
                }, ...this.middlewares, ...routes[path]];
            }
        }

        return null;
    }

    middleware() {
        return this.routes;
    }
}

module.exports = Router;
