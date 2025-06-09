import "dotenv/config";
import Sequelize from "sequelize";

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { database } from "../config/sequelizeOptions.js";

const models = {};
const filename = fileURLToPath(import.meta.url);
const baseModelFolder = path.join(path.dirname(filename), "..", "models/");

const sequelize = new Sequelize(database);
const basename = path.basename(filename);

function readFilesRecursively(dir) {
    let filepaths = [];

    fs.readdirSync(dir, { withFileTypes: true }).filter((file) => {
        if (file.isFile() && file.name.indexOf(".") !== 0 && file.name.slice(-3) === ".js") {
            filepaths.push(dir + file.name);
        } else {
            filepaths = filepaths.concat(readFilesRecursively(dir + file.name + "\\"));
        }
    });

    return filepaths;
}

await (async () => {
    let paths = [];
    paths = readFilesRecursively(baseModelFolder);

    await Promise.all(
        paths.map(async (file) => {
            const module = await import(pathToFileURL(file));
            const model = module.default(sequelize, Sequelize.DataTypes);
            models[model.name] = model;
        })
    );

    Object.keys(models).forEach((modelName) => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });
})();

export { Sequelize, sequelize, models as Models };
