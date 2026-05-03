# 蛇蛇的开发之旅 (Snake's Dev Journey)

一个专注于极客体验与现代美学的个人技术博客系统。基于 Node.js 生态构建，通过全新的 **Modern Dark + Glassmorphism** 设计语言，为开发者提供沉浸式的阅读与创作空间。

---

## ✨ 核心亮点

### 🎨 Premium UI 设计系统
- **极客黑美学**：基于 HSL 调色的深色主题，配合翡翠绿（Emerald）点缀。
- **毛玻璃幻境 (Glassmorphism)**：全站采用高斯模糊背景与半透明边框，营造层级分明的通透感。
- **现代化通知系统 (Toast)**：完全定制的高颜值顶部通知系统，支持成功、错误、警告多种状态，具备平滑的弹性动画。
- **交互式确认弹窗 (Modal)**：替换了原生 `confirm`，提供沉浸式的操作确认体验。
- **动态交互**：全站级 `backgroundPulse` 动态背景、Hero 区域流光（Shine）标题、卡片悬停位移与主题色发光。
- **极客加载体验**：定制设计的极客风蛇形加载器 (`snake-loader`)，带来硬核的科技感等待体验。

### 🛡️ 工业级架构与健壮性
- **集中式错误处理**：全局错误拦截中间件，提供一致的 API 响应格式，确保护航业务稳定性。
- **人性化请求校验**：基于 `Zod` 的 Schema 校验层，并经过深度优化，能将复杂的校验错误转化为易懂的文字提示，拒绝 JSON 乱码。
- **弹性参数校验**：针对封面 URL、文章字数等边界情况进行了规则优化，兼容各种复杂的创作场景。
- **交互式 API 文档**：集成 `Swagger (OpenAPI 3.0)`，实时同步后端接口定义，支持在线调试。
- **高性能图像处理**：集成 `Sharp` 库，上传封面自动进行 WebP 转换与 16:9 裁剪，极大提升首屏性能。

### 📰 内容探索与管理
- **智能检索与分类**：支持关键词全局搜索与技术/游戏/生活等多维度分类切换。
- **管理后台 2.0**：极客风仪表盘，支持 Markdown 编辑、图片粘贴上传、外链封面提取。
- **沉浸式阅读**：自适应智能目录 (TOC)、阅读进度条、代码多语言高亮。

---

## 🛠️ 技术栈

- **核心架构**: Node.js + Express (v5)
- **数据持久化**: MySQL + Sequelize ORM
- **校验与文档**: Zod + Swagger UI
- **图像引擎**: Sharp
- **设计语言**: Vanilla CSS (Modern CSS3)
- **安全防护**: JWT + bcrypt + Helmet + Rate Limit
- **容器化**: Docker + Docker Compose

---

## 📂 项目结构

```text
.
├── middleware/         # 核心中间件 (错误处理、权限验证、数据校验)
├── schemas/            # Zod 数据校验架构定义
├── utils/              # 通用工具类 (AppError)
├── config/             # 数据库配置文件
├── models/             # Sequelize 数据模型
├── public/             # 静态资源中心 (含前端页面与样式)
├── server.js           # 后端入口 (含 Swagger 配置与 API 路由)
├── Dockerfile          # 容器构建配置
├── docker-compose.yml  # 服务编排配置
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

3. **API 文档访问**
   启动后访问 `http://localhost:3000/api-docs` 即可查看完整接口定义。

4. **开启进化之旅**
   ```bash
   npm run dev
   ```

### 生产环境 (Docker)

利用 Docker 实现一键交付：
```bash
docker-compose up -d
```

---

## 🔄 维护与更新

当你在服务器上执行 `git pull` 更新代码后，请务必执行以下操作以确保新功能（如图片优化、API 校验）正常运行：

### 🛠️ 推荐方式 (使用自动化脚本)
项目中已内置 `deploy.sh` 脚本，可一键完成 **拉取代码 -> 更新依赖 -> 数据库迁移 -> 重启服务**：
```bash
chmod +x deploy.sh
./deploy.sh
```

### 📝 手动更新步骤
如果你习惯手动操作，请严格遵循以下顺序：
1. **拉取代码**: `git pull`
2. **安装新依赖**: `npm install --production`  <-- ⚡ **最重要的一步，防止程序崩溃**
3. **数据库迁移**: `npx sequelize-cli db:migrate`
4. **重启进程**: `pm2 restart all` 或 `docker-compose up -d --build`

---

## 🛡️ 安全保证

- **CSP 策略**: 深度优化的内容安全策略。
- **速率限制**: 防止暴力破解与 API 滥用。
- **密码学**: 工业级 bcrypt 哈希加密。
- **统一响应**: 生产环境自动隐藏敏感堆栈信息。

---

## 📜 许可证

本项目基于 **MIT License** 开源。
