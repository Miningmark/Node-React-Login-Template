"use strict";

require("dotenv").config();
const bcrypt = require("bcrypt");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const superAdminUsername = "SuperAdmin";
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD;

        const [existingSuperAdmin] = await queryInterface.sequelize.query("SELECT * FROM `users` WHERE username =:username LIMIT 1", {
            replacements: { username: superAdminUsername },
            type: Sequelize.QueryTypes.SELECT
        });
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        if (!existingSuperAdmin) {
            await queryInterface.bulkInsert("users", [
                {
                    username: superAdminUsername,
                    email: "",
                    password: passwordHash,
                    isActive: true,
                    isDisabled: false
                }
            ]);
        } else if (await bcrypt.compare(adminPassword, existingSuperAdmin.password)) {
            await queryInterface.bulkUpdate("users", {
                password: passwordHash
            });
        }
    }
};
