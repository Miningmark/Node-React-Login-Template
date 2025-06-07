import "dotenv/config";
import express from "express";

import cors from "cors";
import helmet from "helmet";

//Init Express
const app = express();

//Middleware
app.use(cors({ credentials: true, origin: true }));
app.use(helmet());

app.get("/", (req, res) => {
    res.send("Hallo Welt");
});

app.listen(process.env.SERVER_PORT, () => {
    console.log("Server is running on port " + process.env.SERVER_PORT);
});
