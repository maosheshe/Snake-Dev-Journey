'use strict';
const faker = require('faker');
faker.locale = 'zh_CN';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const article = [];
    const userIds = Array.from({length: 10}, (_, i) => i + 1); // 假设有10个用户

    // 生成100篇文章
    for (let i = 1; i <= 100; i++) {
      const userId = i;
      const title = faker.lorem.sentence();
      const content = faker.lorem.paragraphs(faker.random.number({min: 3, max: 10}));

      article.push({
        title: title,
        content: content,
        userId: userId,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }

    await queryInterface.bulkInsert('Articles', article, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Articles', null, {});
  }
}; 