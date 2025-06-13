import "dotenv/config";

const isDevMode = () => process.env.DEV_MODE === "true";

export default isDevMode;
