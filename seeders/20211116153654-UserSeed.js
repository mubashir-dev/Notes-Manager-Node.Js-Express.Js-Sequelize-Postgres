'use strict';
const faker = require('faker');
const passwordHash = require("../helpers/password.hash");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('Users', [
            {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await passwordHash.hash('123456'),
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await passwordHash.hash('123456'),
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await passwordHash.hash('123456'),
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await passwordHash.hash('123456'),
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await passwordHash.hash('123456'),
                createdAt: new Date(),
                updatedAt: new Date()
            }, {
                name: faker.name.findName(),
                username: faker.internet.userName(),
                email: faker.internet.email(),
                password: await passwordHash.hash('123456'),
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);

    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Users', null, {});
    }
};
