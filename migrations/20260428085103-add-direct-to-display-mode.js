'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // MySQL 并不支持直接 ALTER TABLE MODIFY ENUM 来增加值而保持元数据同步，
    // 最安全的方法是使用原始 SQL 更改列类型。
    await queryInterface.sequelize.query(
      "ALTER TABLE Articles MODIFY COLUMN displayMode ENUM('markdown', 'inject', 'iframe', 'direct') DEFAULT 'markdown' NOT NULL;"
    );
  },

  async down (queryInterface, Sequelize) {
    // 回滚时将 'direct' 改回 'markdown'，然后再修改回原来的 ENUM
    await queryInterface.sequelize.query(
      "UPDATE Articles SET displayMode = 'markdown' WHERE displayMode = 'direct';"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE Articles MODIFY COLUMN displayMode ENUM('markdown', 'inject', 'iframe') DEFAULT 'markdown' NOT NULL;"
    );
  }
};
