'use strict';
const {
  Model
} = require('sequelize');
/**
 * 用户模型
 * 定义用户数据表结构和关联关系
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * 用户模型类
   * 包含用户基本信息和关联的文章
   */
  class User extends Model {
    /**
     * 定义模型关联关系
     * @param {Object} models - 包含所有已定义模型的集合
     * 
     * 一个用户可以拥有多篇文章(一对多关系)
     * 外键userId关联到Article表的userId字段
     * 通过articles别名访问关联的文章
     */
    static associate(models) {
      User.hasMany(models.Article, {
        foreignKey: 'userId',
        as: 'articles'
      });
    }
  }
  /**
   * 初始化用户模型字段定义
   * username - 用户名(字符串类型)
   * password - 密码(字符串类型)
   */
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'free'),
      defaultValue: 'free'
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};