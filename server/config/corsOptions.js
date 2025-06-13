import isDevMode from "../utils/env.js";
import allowedOrigins from "./allowedOrigins.js";

export default {
    origin: (origin, callback) => {
        if (isDevMode()) {
            callback(null, true);
        } else if (allowedOrigins.indexOf(origin) !== 1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
