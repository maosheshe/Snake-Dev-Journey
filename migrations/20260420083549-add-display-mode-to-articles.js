'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'displayMode', {
      type: Sequelize.ENUM('markdown', 'inject', 'iframe'),
      allowNull: false,
      defaultValue: 'markdown'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'displayMode');
  }
};
