"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Ensure uuid extension exists for Postgres
    try {
      await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    } catch (e) {
      // ignore if not supported
    }

    await queryInterface.createTable('contests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      access_level: {
        type: Sequelize.ENUM('normal', 'vip'),
        allowNull: false,
        defaultValue: 'normal',
      },
      starts_at: {
        type: Sequelize.DATE,
      },
      ends_at: {
        type: Sequelize.DATE,
      },
      prize_title: {
        type: Sequelize.STRING,
      },
      prize_details: {
        type: Sequelize.TEXT,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('contests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_contests_access_level";');
  },
};
