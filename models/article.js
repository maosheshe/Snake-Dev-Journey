'use strict';
const {
  Model
} = require('sequelize');
/**
 * 文章模型
 * 定义文章数据表结构和关联关系
 */
module.exports = (sequelize, DataTypes) => {
  /**
 * 文章模型类
 * 包含文章基本信息和关联的用户
 */
class Article extends Model {
    /**
     * 定义模型关联关系
     * @param {Object} models - 包含所有已定义模型的集合
     * 
     * 一篇文章属于一个用户(多对一关系)
     * 外键userId关联到User表的id字段
     * 通过user别名访问关联的用户
     */
    static associate(models) {
      Article.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  /**
 * 初始化文章模型字段定义
 * title - 文章标题(字符串类型)
 * content - 文章内容(文本类型)
 */
Article.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    category: {
      type: DataTypes.STRING,
      defaultValue: '未分类'
    },
    tags: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    displayMode: {
      type: DataTypes.ENUM('markdown', 'inject', 'iframe'),
      defaultValue: 'markdown'
    },
    coverUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Article',
  });
  return Article;
};