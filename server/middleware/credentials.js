import config from "./config.js";

export default (req, res, next) => {
    const origin = req.headers.origin;
    if (config.allowedOrigins.indexOf(origin) !== -1) {
        res.header("Access-Control-Allow-Credentials", true);
    }
    next();
};
