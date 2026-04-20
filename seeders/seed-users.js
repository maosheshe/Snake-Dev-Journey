'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [];
    const password = await bcrypt.hash('123456', 10); // 所有测试用户使用相同的密码

    // 生成100个用户
    for (let i = 1; i <= 10; i++) {
      users.push({
        username: `testuser${i}`,
        password: password,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 添加一些特殊用户
    users.push(
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        createdAt: new Date(),
        updatedAt: new Date()   
      },
      {
        username: 'editor',
        password: await bcrypt.hash('editor123', 10),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
}; 