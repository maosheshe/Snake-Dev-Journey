# 个人博客

一个基于 Node.js + Express + MySQL 的个人博客，实现了用户认证、文章管理等基本功能。

## 功能特点

### 用户管理
- 用户注册与登录
- JWT 令牌认证
- 密码加密存储
- 会话管理

### 文章管理
- 文章的增删改查
- Markdown 格式支持
- 文章作者关联
- 分页列表展示
- 代码块语法高亮
- 一键复制代码功能
- 文章目录自动生成
- 搜索功能支持标题和内容的模糊匹配
- 文章列表显示作者和发布时间
- 现代化的搜索框设计和交互体验
- 独立的登录与注册页面，提升用户体验

### 代码展示功能
- 支持多种编程语言的代码高亮
- 代码块自动识别语言
- 一键复制代码到剪贴板
- 复制成功视觉反馈
- 代码语言标签显示

### 安全特性
- 密码加密存储
- JWT 身份验证
- 请求速率限制
- XSS 防护
- SQL 注入防护
- CSP 安全策略
- 代码内容安全转义

## 技术栈

- 后端：Node.js + Express
- 数据库：MySQL
- 认证：JWT + bcrypt
- 前端：原生 JavaScript + HTML5 + CSS3
- Markdown 解析：marked.js
- 代码高亮：highlight.js

## 项目结构

```
.
├── config/             # 配置文件目录
│   └── config.json    # 数据库配置
├── models/            # 数据模型
│   ├── index.js      # 模型入口
│   ├── user.js       # 用户模型
│   └── article.js    # 文章模型
├── public/           # 静态文件
│   ├── js/          # JavaScript 文件
│   │   ├── marked.min.js    # Markdown 解析器
│   │   ├── highlight.min.js # 代码高亮
│   │   └── github.min.css   # 代码高亮主题
│   ├── index.html          # 博客主页
│   ├── article.html        # 文章阅读页面
│   ├── login.html          # 登录页面
│   ├── register.html       # 注册页面
│   └── admin/             # 管理界面
│       ├── dashboard.html # 控制面板
│       ├── articles.html  # 文章列表
│       └── article-detail.html # 文章详情/编辑页
├── server.js        # 服务器入口文件
├── models/          # Sequelize 数据模型
├── migrations/      # 数据库迁移文件
├── seeders/         # 数据库种子数据
├── .env            # 环境变量配置
└── README.md       # 项目说明文档
```

## 安装与运行

1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件并配置以下变量：
```
DB_HOST=你的数据库主机
DB_USER=数据库用户名
DB_PASSWORD=数据库密码
DB_NAME=数据库名称
JWT_SECRET=你的JWT密钥
PORT=3000
```

4. 初始化数据库
```bash
npx sequelize-cli db:migrate
```

5. 运行项目
```bash
npm start
```

## 使用说明

### 文章编写
1. 使用 Markdown 语法编写文章
2. 代码块语法：
   ```markdown
   ```语言名称
   代码内容
   ```
   ```
3. 支持的编程语言：
   - JavaScript/TypeScript
   - Python
   - Java
   - HTML/CSS
   - SQL
   - 等多种常用语言

### 代码复制功能
1. 每个代码块右上角都有"复制代码"按钮
2. 点击按钮即可复制代码到剪贴板
3. 复制成功会显示"已复制！"提示
4. 左上角显示代码语言类型

## API 接口

### 用户接口
- POST /api/register - 用户注册
- POST /api/login - 用户登录

### 文章接口
- GET /api/articles - 获取文章列表
- GET /api/articles/:id - 获取文章详情
- POST /api/articles - 创建新文章
- PUT /api/articles/:id - 更新文章
- DELETE /api/articles/:id - 删除文章

## 安全说明

1. 密码安全
   - 使用 bcrypt 加密存储
   - 密码强度要求
   - 登录失败限制

2. 接口安全
   - JWT 身份验证
   - 请求速率限制
   - 参数验证

3. 数据安全
   - SQL 注入防护
   - XSS 防护
   - CSP 策略
   - 代码内容安全转义

## 开发规范

1. 代码规范
   - 使用 ESLint 进行代码检查
   - 遵循 JavaScript 标准风格
   - 添加适当的注释

2. Git 规范
   - 遵循语义化版本控制
   - 使用规范的提交信息
   - 分支管理策略

## 维护与更新

- 定期更新依赖包
- 监控系统性能
- 及时修复安全漏洞
- 持续优化用户体验

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过以下方式联系：
- 项目 Issues
- 邮件联系


