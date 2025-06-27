"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert("users", [
            {
                username: "Alice1",
                email: "alice1@example.com",
                password: "test123"
            },
            {
                username: "Bob1",
                email: "bob1@example.com",
                password: "test123"
            },
            {
                username: "Alice2",
                email: "alice2@example.com",
                password: "test456"
            },
            {
                username: "Bob2",
                email: "bob2@example.com",
                password: "test456"
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete("users", null, {});
    }
};
