import config from "./config.js";

export default {
    origin: (origin, callback) => {
        if (config.isDevServer) {
            callback(null, true);
        } else if (config.allowedOrigins.indexOf(origin) !== 1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
