# 蛇蛇的开发之旅 (Snake's Dev Journey)

一个专注于极客体验与现代美学的个人技术博客系统。基于 Node.js 生态构建，通过全新的 **Modern Dark + Glassmorphism** 设计语言，为开发者提供沉浸式的阅读与创作空间。

---

## ✨ 核心亮点

### 🎨 Premium UI 设计系统
- **极客黑美学**：基于 HSL 调色的深色主题，配合翡翠绿（Emerald）点缀。
- **毛玻璃幻境 (Glassmorphism)**：全站采用高斯模糊背景与半透明边框，营造层级分明的通透感。
- **动态交互**：全站级 `backgroundPulse` 动态背景、Hero 区域流光（Shine）标题、卡片悬停位移与主题色发光。
- **极客加载体验**：定制设计的极客风蛇形加载器 (`snake-loader`)，带来硬核的科技感等待体验。
- **响应式布局**：完美适配移动端、平板与桌面端。

### 📰 内容探索与分类
- **智能检索**：首页支持基于关键词的全局文章搜索。
- **分类筛选**：支持快速切换“技术”、“游戏”、“生活”、“随笔”等分类，一键定位感兴趣的内容。
- **分页加载**：平滑的分页与加载体验，无缝浏览内容。

### 🎮 创意小游戏展示页
- **独立游戏画廊**：专属的 `games.html` 页面，展示本地开发的精品 HTML5 游戏。
- **沉浸式游玩**：支持在文章详情页以 HTML 注入模式直接运行复杂的小游戏。

### 🛠️ 管理后台 2.0 (Admin Suite)
- **全新仪表盘**：实时统计文章总数、阅读量与点赞数。
- **极客编辑器**：深色模式编辑器，支持 Markdown 与 HTML 模式切换。
- **智能图片处理**：
  - 支持智能提取外网图片作为封面。
  - 支持**编辑器内直接粘贴图片**或拖拽上传，自动上传并保存至本地。
- **侧边导航体系**：高效管理文章、发布作品与数据监控。

### 📖 深度阅读体验
- **自适应智能目录 (TOC)**：目录自动吸附于页面左侧，支持文章标题提取与滚动联动。当文章无标题时，主体内容自动单列铺满。
- **阅读进度条**：顶部实时显示阅读进度。
- **代码实验室**：支持多语言高亮、一键复制代码块，具备精美的内容区排版。

---

## 🛠️ 技术栈

- **核心架构**: Node.js + Express (v5)
- **数据持久化**: MySQL + Sequelize ORM
- **安全认证**: JWT (JSON Web Token) + bcrypt
- **设计语言**: Vanilla CSS (Modern CSS3)
- **视觉增强**: 
  - **Icons**: Lucide Icons (CDN)
  - **Typography**: Google Fonts (Outfit & JetBrains Mono)
  - **Effects**: Backdrop-filter & CSS Animations
- **渲染引擎**: 
  - **Markdown**: marked.js
  - **Code Highlight**: highlight.js
- **进程管理**: PM2

---

## 📂 项目结构

```text
.
├── config/             # 数据库配置文件
├── models/             # Sequelize 数据模型 (User, Article)
├── public/             # 静态资源中心
│   ├── css/            # 核心样式表 (main.css 设计系统)
│   ├── js/             # 前端依赖库
│   ├── images/         # 图片资源 (封面图、上传图片)
│   ├── game/           # 本地精品小游戏与上传的 HTML
│   ├── admin/          # 管理后台 (仪表盘、管理、发布)
│   ├── index.html      # 科技感 Hero 首页
│   ├── games.html      # 游戏展示画廊
│   ├── article.html    # 沉浸式文章阅读页
│   └── login.html      # 毛玻璃登录界面
├── server.js           # 后端入口 (含安全配置与 API 路由)
├── ecosystem.config.js # PM2 部署配置
├── .env                # 环境密钥配置
└── README.md           # 项目说明文档
```

---

## 🚀 快速启动

### 开发环境

1. **安装依赖**
   ```bash
   npm install
   ```

2. **数据库配置**
   复制 `env .example` 为 `.env` 并填写你的数据库与 JWT 密钥。

3. **执行迁移与同步**
   ```bash
   npx sequelize-cli db:migrate
   ```

4. **开启进化之旅**
   ```bash
   npm run dev
   ```
   > 默认运行在 `http://localhost:3000`

### 生产环境

利用 PM2 启动高可用的守护进程：
```bash
npm run start
```
停止服务：
```bash
npm run stop
```

---

## 🛡️ 安全保证

- **CSP 策略**: 深度优化的内容安全策略，在放行 CDN 资源的同时严防 XSS 攻击。
- **速率限制**: 防止恶意 API 暴力破解。
- **密码学**: 工业级 bcrypt 加密，确保存储安全。
- **跨域与 HTTP 头**: 集成 CORS 与 Helmet 提供标准安全防护。

---

## 📜 许可证

本项目基于 **MIT License** 开源。
