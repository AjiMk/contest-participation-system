"use strict";
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Create two contests: one normal and one vip
    const now = new Date();
    const normalContestId = uuidv4();
    const vipContestId = uuidv4();

    await queryInterface.bulkInsert('contests', [
      {
        id: normalContestId,
        name: 'Sample Normal Contest',
        description: 'A sample contest open to all normal users',
        access_level: 'normal',
        starts_at: new Date(Date.now() - 1000 * 60 * 60),
        ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        prize_title: 'Normal Prize',
        prize_details: 'A sample prize for normal contest',
        created_by: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: vipContestId,
        name: 'Sample VIP Contest',
        description: 'A sample contest restricted to VIP users',
        access_level: 'vip',
        starts_at: new Date(Date.now() - 1000 * 60 * 60),
        ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
        prize_title: 'VIP Prize',
        prize_details: 'A special VIP prize',
        created_by: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Questions for normal contest
    const normalQ1 = uuidv4();
    const normalQ2 = uuidv4();

    await queryInterface.bulkInsert('questions', [
      {
        id: normalQ1,
        contest_id: normalContestId,
        prompt: 'What is 2 + 2?',
        type: 'multiple_choice',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: normalQ2,
        contest_id: normalContestId,
        prompt: 'Which language is this project written in?',
        type: 'multiple_choice',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Options for normal questions
    await queryInterface.bulkInsert('options', [
      { id: uuidv4(), question_id: normalQ1, label: '3', is_correct: false, createdAt: now, updatedAt: now },
      { id: uuidv4(), question_id: normalQ1, label: '4', is_correct: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), question_id: normalQ1, label: '5', is_correct: false, createdAt: now, updatedAt: now },

      { id: uuidv4(), question_id: normalQ2, label: 'Python', is_correct: false, createdAt: now, updatedAt: now },
      { id: uuidv4(), question_id: normalQ2, label: 'TypeScript', is_correct: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), question_id: normalQ2, label: 'Ruby', is_correct: false, createdAt: now, updatedAt: now },
    ]);

    // Questions & options for VIP contest
    const vipQ1 = uuidv4();
    await queryInterface.bulkInsert('questions', [
      {
        id: vipQ1,
        contest_id: vipContestId,
        prompt: 'What does VIP stand for in this app?',
        type: 'multiple_choice',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('options', [
      { id: uuidv4(), question_id: vipQ1, label: 'Very Important Person', is_correct: true, createdAt: now, updatedAt: now },
      { id: uuidv4(), question_id: vipQ1, label: 'Very Important Process', is_correct: false, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    // Delete inserted records by name
    await queryInterface.bulkDelete('options', null, {});
    await queryInterface.bulkDelete('questions', null, {});
    await queryInterface.bulkDelete('contests', { name: ['Sample Normal Contest', 'Sample VIP Contest'] }, {});
  },
};
