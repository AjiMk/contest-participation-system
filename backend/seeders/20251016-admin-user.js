"use strict";
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('users', [
      {
        id: require('crypto').randomUUID(),
        email: 'admin@example.com',
        password: passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  },
};
