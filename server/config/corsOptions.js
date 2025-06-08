import allowedOrigins from "./allowedOrigins.js";

export default {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== 1 /*TODO: remove -> */ || true) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
