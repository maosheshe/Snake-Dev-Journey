'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 为 Users 表增加 role 字段
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('admin', 'free'),
      defaultValue: 'free',
      allowNull: false
    });

    // 为 Articles 表增加 coverUrl 字段
    await queryInterface.addColumn('Articles', 'coverUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.removeColumn('Articles', 'coverUrl');
    
    // 删除 ENUM 类型 (MySQL)
    // 注意：某些数据库系统可能需要特殊处理 ENUM 的删除
  }
};
