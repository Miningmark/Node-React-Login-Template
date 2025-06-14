import config from "./config.js";
import allowedOrigins from "./allowedOrigins.js";

export default {
    origin: (origin, callback) => {
        if (config.isDevServer) {
            callback(null, true);
        } else if (allowedOrigins.indexOf(origin) !== 1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
