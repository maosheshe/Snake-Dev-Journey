'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '未分类'
    });
    await queryInterface.addColumn('Articles', 'tags', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
    await queryInterface.addColumn('Articles', 'views', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Articles', 'likes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'category');
    await queryInterface.removeColumn('Articles', 'tags');
    await queryInterface.removeColumn('Articles', 'views');
    await queryInterface.removeColumn('Articles', 'likes');
  }
};
