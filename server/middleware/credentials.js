import allowedOrigins from "../config/allowedOrigins.js";

export default (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) !== -1) {
        res.header("Access-Control-Allow-Credentials", true);
    }
    next();
};
